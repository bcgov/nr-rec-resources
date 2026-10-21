package ca.bc.gov.nrs.environment.fta.el.services;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class TenureExportService {

  private static final String TYPE_CODE_RL = "RL";
  private static final String TYPE_CODE_RPO = "RPO";
  private static final HexFormat HEX_FORMAT = HexFormat.of();

  private static final String REC_TENURE_APPLICATION_SQL = """
      SELECT ta.*
      FROM TENURE_APPLICATION ta
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY ta.TENURE_APP_ID
      """;

  private static final String REC_TENURE_APP_IMAGE_SQL = """
      SELECT tai.*
      FROM TENURE_APPLICATION ta
      JOIN TENURE_APPLICATION_IMAGE tai ON ta.TENURE_APP_ID = tai.TENURE_APP_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY tai.TENURE_APP_ID
      """;

  private static final String REC_TENURE_MAP_FEATURE_SQL = """
      SELECT tamf.*
      FROM TENURE_APPLICATION ta
      JOIN TENURE_APPLICATION_MAP_FEATURE tamf ON ta.TENURE_APP_ID = tamf.TENURE_APP_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY tamf.MAP_FEATURE_ID
      """;

  private static final String REC_TENURE_MF_IMAGE_SQL = """
      SELECT tami.*
      FROM TENURE_APPLICATION ta
      JOIN TENURE_APPLICATION_MAP_FEATURE tamf ON ta.TENURE_APP_ID = tamf.TENURE_APP_ID
      JOIN TENURE_APPLICATION_MF_IMAGE tami ON tamf.MAP_FEATURE_ID = tami.MAP_FEATURE_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY tami.MAP_FEATURE_ID
      """;

  private final Logger logger = LoggerFactory.getLogger(TenureExportService.class);
  private final DataSource dataSource;
  private final S3UploaderService s3UploaderService;

  @Value("${ca.bc.gov.nrs.environment.fta.el.file-base-path}")
  private String fileBasePath;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.batch-row-count:5000}")
  private int tenureImageBatchRowCount;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.fetch-size:500}")
  private int tenureFetchSize;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.csv-export-enabled:true}")
  private boolean tenureImageCsvExportEnabled;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.object-upload-enabled:true}")
  private boolean tenureImageObjectUploadEnabled;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.exhibit-prefix:Exhibit_A}")
  private String exhibitImagePrefix;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.map-prefix:map_images}")
  private String mapImagePrefix;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.export-target:all}")
  private String tenureImageExportTarget;

  public TenureExportService(DataSource dataSource, S3UploaderService s3UploaderService) {
    this.dataSource = dataSource;
    this.s3UploaderService = s3UploaderService;
  }

  public void extractAndUploadTenureDataToS3() {
    ensureOutputDirectoryExists();

    String imageExportTarget = normalizeImageExportTarget();

    if (shouldExportCoreTables(imageExportTarget)) {
      exportTableAsCsv("REC_TENURE_APPLICATION.csv", REC_TENURE_APPLICATION_SQL);
      exportTableAsCsv("REC_TENURE_MAP_FEATURE.csv", REC_TENURE_MAP_FEATURE_SQL);
    }

    if (tenureImageCsvExportEnabled) {
      if (shouldExportAppImages(imageExportTarget)) {
        exportTableAsCsvInBatches("REC_TENURE_APP_IMAGE.csv", REC_TENURE_APP_IMAGE_SQL);
      }
      if (shouldExportMfImages(imageExportTarget)) {
        exportTableAsCsvInBatches("REC_TENURE_MF_IMAGE.csv", REC_TENURE_MF_IMAGE_SQL);
      }
    }

    if (tenureImageObjectUploadEnabled) {
      if (shouldExportAppImages(imageExportTarget)) {
        uploadImageObjectsToS3(REC_TENURE_APP_IMAGE_SQL, exhibitImagePrefix, "TENURE_APP_IMAGE");
      }
      if (shouldExportMfImages(imageExportTarget)) {
        uploadImageObjectsToS3(REC_TENURE_MF_IMAGE_SQL, mapImagePrefix, "TENURE_MF_IMAGE");
      }
    }
  }

  private String normalizeImageExportTarget() {
    if (tenureImageExportTarget == null || tenureImageExportTarget.isBlank()) {
      return "all";
    }

    String normalized = tenureImageExportTarget.trim().toLowerCase(Locale.ROOT);
    if ("all".equals(normalized) || "core".equals(normalized) || "app".equals(normalized) || "mf".equals(normalized)) {
      return normalized;
    }

    logger.warn("Invalid tenure image export target '{}', defaulting to 'all'", tenureImageExportTarget);
    return "all";
  }

  private boolean shouldExportCoreTables(String imageExportTarget) {
    return "all".equals(imageExportTarget) || "core".equals(imageExportTarget);
  }

  private boolean shouldExportAppImages(String imageExportTarget) {
    return "all".equals(imageExportTarget) || "app".equals(imageExportTarget);
  }

  private boolean shouldExportMfImages(String imageExportTarget) {
    return "all".equals(imageExportTarget) || "mf".equals(imageExportTarget);
  }

  private void uploadImageObjectsToS3(String sql, String rootPrefix, String fallbackFilePrefix) {
    try (
      Connection connection = dataSource.getConnection();
      PreparedStatement preparedStatement = connection.prepareStatement(sql)
    ) {
      preparedStatement.setFetchSize(tenureFetchSize);
      preparedStatement.setString(1, TYPE_CODE_RL);
      preparedStatement.setString(2, TYPE_CODE_RPO);

      try (ResultSet resultSet = preparedStatement.executeQuery()) {
        ResultSetMetaData metadata = resultSet.getMetaData();
        int blobColumnIndex = findFirstBinaryColumnIndex(metadata);
        if (blobColumnIndex < 0) {
          logger.warn("No BLOB/RAW column found for {} export, skipping object upload", rootPrefix);
          return;
        }

        int recResourceIdColumnIndex = findColumnIndex(metadata, "REC_RESOURCE_ID");
        int submissionIdColumnIndex = findColumnIndex(metadata, "SUBMISSION_ID");
        int fileNameColumnIndex = findColumnIndex(metadata, "FILE_NAME", "IMAGE_FILE_NAME", "ATTACHMENT_FILE_NAME");
        int contentTypeColumnIndex = findColumnIndex(metadata, "CONTENT_TYPE", "MIME_TYPE");
        int imageIdColumnIndex = findColumnIndex(metadata,
          "TENURE_APP_IMAGE_ID",
          "TENURE_MF_IMAGE_ID",
          "MF_IMAGE_ID",
          "MAP_FEATURE_IMAGE_ID",
          "MAP_FEATURE_ID",
          "TENURE_APP_ID");

        long uploadedRows = 0;
        while (resultSet.next()) {
          Blob blob = resultSet.getBlob(blobColumnIndex);
          if (blob == null || blob.length() == 0) {
            if (blob != null) {
              blob.free();
            }
            continue;
          }

          long contentLength = blob.length();
          String recResourceId = sanitizePathSegment(getColumnValue(resultSet, recResourceIdColumnIndex), "unknown_resource");
          String submissionId = sanitizePathSegment(getColumnValue(resultSet, submissionIdColumnIndex), "unknown_submission");
          String contentType = getColumnValue(resultSet, contentTypeColumnIndex);
          String defaultFileName = fallbackFilePrefix + "_" + (uploadedRows + 1) + extensionFromContentType(contentType);
          String fileName = sanitizeFileName(getColumnValue(resultSet, fileNameColumnIndex), defaultFileName);

          String stableId = sanitizePathSegment(getColumnValue(resultSet, imageIdColumnIndex), "");
          if (!stableId.isBlank() && !fileName.contains(".")) {
            fileName = fileName + "_" + stableId;
          }

          String objectKey = String.format("%s/%s/%s/%s", sanitizePrefix(rootPrefix), recResourceId, submissionId, fileName);
          try (InputStream stream = blob.getBinaryStream()) {
            s3UploaderService.uploadStreamToS3(objectKey, stream, contentLength, contentType);
          } finally {
            blob.free();
          }
          uploadedRows++;
        }
        logger.info("Uploaded {} image objects to S3 under prefix {}", uploadedRows, rootPrefix);
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed image object upload for prefix " + rootPrefix, e);
    }
  }

  private void exportTableAsCsv(String fileName, String sql) {
    Path outputPath = Path.of(fileBasePath, fileName);
    long rows = 0;

    try {
      try (
        Connection connection = dataSource.getConnection();
        PreparedStatement preparedStatement = connection.prepareStatement(sql);
        FileWriter fileWriter = new FileWriter(outputPath.toFile());
        CSVPrinter csvPrinter = new CSVPrinter(fileWriter, CSVFormat.DEFAULT)
      ) {
        preparedStatement.setFetchSize(tenureFetchSize);
        preparedStatement.setString(1, TYPE_CODE_RL);
        preparedStatement.setString(2, TYPE_CODE_RPO);

        try (ResultSet resultSet = preparedStatement.executeQuery()) {
          var metadata = resultSet.getMetaData();
          printHeader(csvPrinter, metadata);
          csvPrinter.println();

          while (resultSet.next()) {
            printRow(csvPrinter, resultSet, metadata);
            rows++;
          }
        }
      }

      s3UploaderService.uploadFileToS3(outputPath.toString(), fileName);
      logger.info("Exported {} rows to {} and uploaded as {}", rows, outputPath, fileName);
    } catch (Exception e) {
      throw new RuntimeException("Failed to export table for file " + fileName, e);
    } finally {
      deleteLocalFile(outputPath);
    }
  }

  private void exportTableAsCsvInBatches(String baseFileName, String sql) {
    PartWriter currentPart = null;
    try (
      Connection connection = dataSource.getConnection();
      PreparedStatement preparedStatement = connection.prepareStatement(sql)
    ) {
      preparedStatement.setFetchSize(tenureFetchSize);
      preparedStatement.setString(1, TYPE_CODE_RL);
      preparedStatement.setString(2, TYPE_CODE_RPO);

      try (ResultSet resultSet = preparedStatement.executeQuery()) {
        ResultSetMetaData metadata = resultSet.getMetaData();
        String baseName = baseFileName.replaceFirst("(?i)\\.csv$", "");
        int partIndex = 1;
        long totalRows = 0;
        int rowsInCurrentPart = 0;
        currentPart = createPartWriter(baseName, partIndex, metadata);

        while (resultSet.next()) {
          if (rowsInCurrentPart >= tenureImageBatchRowCount) {
            closeAndUploadPart(currentPart);
            logger.info("Uploaded batch file {} with {} rows", currentPart.fileName(), rowsInCurrentPart);
            partIndex++;
            rowsInCurrentPart = 0;
            currentPart = createPartWriter(baseName, partIndex, metadata);
          }

          printRow(currentPart.csvPrinter(), resultSet, metadata);
          rowsInCurrentPart++;
          totalRows++;
        }

        closeAndUploadPart(currentPart);
        currentPart = null;
        logger.info("Exported {} rows to {} batch file(s) for {}", totalRows, partIndex, baseFileName);
      }
    } catch (Exception e) {
      cleanupPartWriter(currentPart);
      throw new RuntimeException("Failed to export table in batches for file " + baseFileName, e);
    }
  }

  private void closeAndUploadPart(PartWriter partWriter) throws IOException {
    try {
      partWriter.close();
      s3UploaderService.uploadFileToS3(partWriter.outputPath().toString(), partWriter.fileName());
    } finally {
      deleteLocalFile(partWriter.outputPath());
    }
  }

  private void cleanupPartWriter(PartWriter partWriter) {
    if (partWriter == null) {
      return;
    }

    try {
      partWriter.close();
    } catch (IOException e) {
      logger.warn("Failed to close partial export file {}", partWriter.outputPath(), e);
    } finally {
      deleteLocalFile(partWriter.outputPath());
    }
  }

  private PartWriter createPartWriter(String baseName, int partIndex, ResultSetMetaData metadata)
      throws IOException, SQLException {
    String partFileName = String.format(Locale.ROOT, "%s_part%04d.csv", baseName, partIndex);
    Path outputPath = Path.of(fileBasePath, partFileName);
    FileWriter fileWriter = new FileWriter(outputPath.toFile());
    CSVPrinter csvPrinter = new CSVPrinter(fileWriter, CSVFormat.DEFAULT);
    printHeader(csvPrinter, metadata);
    csvPrinter.println();
    return new PartWriter(partFileName, outputPath, fileWriter, csvPrinter);
  }

  private void printHeader(CSVPrinter csvPrinter, ResultSetMetaData metadata) throws SQLException, IOException {
    for (int columnIndex = 1; columnIndex <= metadata.getColumnCount(); columnIndex++) {
      csvPrinter.print(metadata.getColumnName(columnIndex));
    }
  }

  private void printRow(
      CSVPrinter csvPrinter,
      ResultSet resultSet,
      ResultSetMetaData metadata
  ) throws SQLException, IOException {
    for (int columnIndex = 1; columnIndex <= metadata.getColumnCount(); columnIndex++) {
      Object value;
      if (metadata.getColumnType(columnIndex) == Types.BLOB) {
        Blob blob = resultSet.getBlob(columnIndex);
        value = blob == null ? null : blobToBytes(blob);
      } else if ("RAW".equalsIgnoreCase(metadata.getColumnTypeName(columnIndex))) {
        value = resultSet.getBytes(columnIndex);
      } else {
        value = resultSet.getObject(columnIndex);
      }

      csvPrinter.print(serializeValue(value, metadata.getColumnName(columnIndex)));
    }
    csvPrinter.println();
  }

  private String serializeValue(Object value, String columnName) {
    if (value == null) {
      return null;
    }

    if (value instanceof byte[] byteArray) {
      if (isGuidColumn(columnName) && byteArray.length == 16) {
        return toGuid(byteArray);
      }
      return toHex(byteArray);
    }

    return String.valueOf(value);
  }

  private boolean isGuidColumn(String columnName) {
    return columnName != null && columnName.toUpperCase(Locale.ROOT).endsWith("_GUID");
  }

  private String toGuid(byte[] bytes) {
    String hex = HEX_FORMAT.formatHex(bytes);
    return String.format(
      Locale.ROOT,
      "%s-%s-%s-%s-%s",
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    );
  }

  private int findFirstBinaryColumnIndex(ResultSetMetaData metadata) throws SQLException {
    for (int i = 1; i <= metadata.getColumnCount(); i++) {
      if (metadata.getColumnType(i) == Types.BLOB || "RAW".equalsIgnoreCase(metadata.getColumnTypeName(i))) {
        return i;
      }
    }
    return -1;
  }

  private int findColumnIndex(ResultSetMetaData metadata, String... candidateNames) throws SQLException {
    for (String candidateName : candidateNames) {
      for (int i = 1; i <= metadata.getColumnCount(); i++) {
        String label = metadata.getColumnLabel(i);
        String columnName = metadata.getColumnName(i);
        if (candidateName.equalsIgnoreCase(label) || candidateName.equalsIgnoreCase(columnName)) {
          return i;
        }
      }
    }
    return -1;
  }

  private String getColumnValue(ResultSet resultSet, int columnIndex) throws SQLException {
    if (columnIndex < 0) {
      return null;
    }
    Object value = resultSet.getObject(columnIndex);
    return value == null ? null : String.valueOf(value);
  }

  private String sanitizePrefix(String prefix) {
    if (prefix == null || prefix.isBlank()) {
      return "images";
    }
    return prefix.replaceAll("^/+", "").replaceAll("/+$", "");
  }

  private String sanitizePathSegment(String value, String fallback) {
    if (value == null || value.isBlank()) {
      return fallback;
    }
    return value.trim().replaceAll("[^A-Za-z0-9._-]", "_");
  }

  private String sanitizeFileName(String value, String fallback) {
    String normalized = sanitizePathSegment(value, fallback);
    if (normalized.equals(".") || normalized.equals("..")) {
      return fallback;
    }
    return normalized;
  }

  private String extensionFromContentType(String contentType) {
    if (contentType == null || contentType.isBlank()) {
      return "";
    }
    return switch (contentType.toLowerCase(Locale.ROOT)) {
      case "image/jpeg", "image/jpg" -> ".jpg";
      case "image/png" -> ".png";
      case "image/gif" -> ".gif";
      case "application/pdf" -> ".pdf";
      default -> "";
    };
  }

  private String toHex(byte[] bytes) {
    return HEX_FORMAT.formatHex(bytes);
  }

  private byte[] blobToBytes(Blob blob) throws SQLException {
    try {
      return blob.getBytes(1, (int) blob.length());
    } finally {
      blob.free();
    }
  }

  private void ensureOutputDirectoryExists() {
    try {
      Files.createDirectories(Path.of(fileBasePath));
    } catch (IOException e) {
      throw new RuntimeException("Unable to create output directory: " + fileBasePath, e);
    }
  }

  private void deleteLocalFile(Path outputPath) {
    try {
      Files.deleteIfExists(outputPath);
    } catch (IOException e) {
      logger.warn("Failed to delete temporary file {}", outputPath, e);
    }
  }

  private record PartWriter(String fileName, Path outputPath, FileWriter fileWriter, CSVPrinter csvPrinter) {
    private void close() throws IOException {
      csvPrinter.flush();
      csvPrinter.close();
      fileWriter.close();
    }
  }
}

