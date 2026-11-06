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
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
public class TenureExportService {

  private static final HexFormat HEX_FORMAT = HexFormat.of();

  private static final String REC_TENURE_APPLICATION_SQL = """
      SELECT ta.TENURE_APP_ID,
             ta.TENURE_APPNAME,
             ta.SUBMISSION_ID,
             ta.FOREST_FILE_ID,
             ta.CLIENT_NUMBER,
             ta.CLIENT_LOCN_CODE,
             ta.TENURE_APPLICATION_TYPE_CODE,
             ta.CASCADE_SPLIT_CODE,
             ta.TENURE_APPLICATION_STATE_CODE,
             ta.TENURE_APP_PURP_CODE,
             ta.ADJUDICATION_IND,
             ta.ADJUDICATED_BY,
             ta.ADJUDICATION_DATE,
             CAST(NULL AS TIMESTAMP) AS DECISION_DATE,
             ta.ADJUDICATION_REQUESTED_IND,
             ta.CURRENT_ASSIGNED_TO,
             ta.IMAGE_CREATED_IND,
             ta.MAP_REPORT_CREATED_IND,
             ta.DESCRIPTION,
             ta.MIN_X,
             ta.MIN_Y,
             ta.MAX_X,
             ta.MAX_Y,
             ta.MANAGEMENT_UNIT_NUMBER,
             ta.MANAGEMENT_UNIT_BLOCK,
             ta.MANAGEMENT_UNIT_SUB_BLOCK,
             ta.COMPLETION_DATE,
             ta.FINALIZED_BY,
             ta.SUBMISSION_DATE,
             ta.IMAGE_ERROR,
             ta.MAP_REPORT_ERROR,
             ta.SPATIAL_DATA_ERROR,
             ta.SPATIAL_IND,
             ta.FILE_CREATED_IND,
             ta.IMAGE_HEIGHT,
             ta.IMAGE_WIDTH,
             ta.METERS_PER_PIXEL,
             ta.IMAGE_SCALE,
             ta.ADJUDICATION_COMMENT,
             ta.CUTTING_PERMIT_ID,
             ta.IMAGE_MAP_SIZE_CODE,
             ta.ORG_UNIT_NO,
             ta.GEO_ORG_UNIT_NO,
             ta.IMAGE_MIME_TYPE_CODE,
             ta.IMAGE_ORIENTATION_CODE,
             ta.IMAGE_CREATE_IN_PROGRESS_IND,
             ta.IMAGE_CREATE_REQUESTED_BY,
             ta.IMAGE_CREATE_REQUESTED_DATE,
             ta.OVERLAY_GEO_DISTRICT_CODE,
             ta.BCGS_MAPSHEET_NO,
             ta.TSA_NUMBER,
             ta.LAND_DISTRICT,
             ta.PULPWOOD_AGREEMENT,
             ta.UTM_ZONE,
             ta.REVISION_COUNT,
             ta.ENTRY_USERID,
             ta.ENTRY_TIMESTAMP,
             ta.UPDATE_USERID,
             ta.UPDATE_TIMESTAMP,
             ta.TENURE_APP_GUID,
             ta.APPLICATION_DECISION_MESSAGE,
             ta.CLEARANCE_STATUS_REQUEST_URI,
             ta.DEPENDENT_SUBMISSION_REFERENCE,
             ta.TENURE_AMENDMENT_ID,
             ta.BUSINESS_AMENDMENT_ID
      FROM TENURE_APPLICATION ta
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY ta.TENURE_APP_ID
      """;

  private static final String REC_TENURE_APP_IMAGE_SQL = """
      SELECT ta.TENURE_APP_GUID,
             ta.SUBMISSION_ID,
             ta.FOREST_FILE_ID,
             'Exhibit_A/' || NVL(ta.FOREST_FILE_ID, 'unknown_resource') || '/' || NVL(TO_CHAR(ta.SUBMISSION_ID), 'unknown_submission') || '/' ||
             'TENURE_APP_IMAGE_' || ROW_NUMBER() OVER (ORDER BY ta.TENURE_APP_ID) || '_' || ta.TENURE_APP_ID ||
             CASE UPPER(TRIM(ta.IMAGE_MIME_TYPE_CODE))
               WHEN 'PDF' THEN '.pdf'
               WHEN 'JPG' THEN '.jpg'
               WHEN 'JPEG' THEN '.jpg'
               WHEN 'PNG' THEN '.png'
               WHEN 'GIF' THEN '.gif'
               ELSE ''
             END AS IMAGE_FILE_NAME,
             CASE UPPER(TRIM(ta.IMAGE_MIME_TYPE_CODE))
               WHEN 'PDF' THEN 'pdf'
               WHEN 'JPG' THEN 'jpg'
               WHEN 'JPEG' THEN 'jpg'
               WHEN 'PNG' THEN 'png'
               WHEN 'GIF' THEN 'gif'
               ELSE NULL
             END AS IMAGE_EXTENSION,
             DBMS_LOB.GETLENGTH(tai.EXHIBIT_A_IMAGE) AS IMAGE_FILE_SIZE,
             ta.IMAGE_MAP_SIZE_CODE,
             ta.IMAGE_ORIENTATION_CODE,
             TO_CHAR(ta.IMAGE_SCALE) AS IMAGE_SCALE,
             tai.ENTRY_TIMESTAMP,
             tai.UPDATE_TIMESTAMP,
             tai.ENTRY_USERID,
             tai.UPDATE_USERID
      FROM TENURE_APPLICATION ta
      JOIN TENURE_APPLICATION_IMAGE tai ON ta.TENURE_APP_ID = tai.TENURE_APP_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY ta.TENURE_APP_ID
      """;

  private static final String REC_TENURE_APP_IMAGE_UPLOAD_SQL = """
      SELECT ta.FOREST_FILE_ID,
             ta.SUBMISSION_ID,
             ta.TENURE_APP_ID,
             tai.*
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

  private static final String REC_TENURE_MF_IMAGE_UPLOAD_SQL = """
      SELECT ta.FOREST_FILE_ID,
             ta.SUBMISSION_ID,
             tamf.MAP_FEATURE_ID,
             tami.*
      FROM TENURE_APPLICATION ta
      JOIN TENURE_APPLICATION_MAP_FEATURE tamf ON ta.TENURE_APP_ID = tamf.TENURE_APP_ID
      JOIN TENURE_APPLICATION_MF_IMAGE tami ON tamf.MAP_FEATURE_ID = tami.MAP_FEATURE_ID
      WHERE ta.TENURE_APPLICATION_TYPE_CODE IN (?, ?)
      ORDER BY tami.MAP_FEATURE_ID
      """;

  private final Logger logger = LoggerFactory.getLogger(TenureExportService.class);
  private final DataSource dataSource;
  private final S3UploaderService s3UploaderService;
  private final TenureApplicationService tenureApplicationService;

  @Value("${ca.bc.gov.nrs.environment.fta.el.file-base-path}")
  private String fileBasePath;


  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.fetch-size:500}")
  private int tenureFetchSize;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.csv-export-enabled:true}")
  private boolean tenureImageCsvExportEnabled;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.object-upload-enabled:true}")
  private boolean tenureImageObjectUploadEnabled;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.exhibit-prefix:Exhibit_A}")
  private String exhibitImagePrefix;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.map-prefix:tenure_mf_images}")
  private String mapImagePrefix;

  @Value("${ca.bc.gov.nrs.environment.fta.el.tenure.image.export-target:all}")
  private String tenureImageExportTarget;

  public TenureExportService(
      DataSource dataSource,
      S3UploaderService s3UploaderService,
      TenureApplicationService tenureApplicationService
  ) {
    this.dataSource = dataSource;
    this.s3UploaderService = s3UploaderService;
    this.tenureApplicationService = tenureApplicationService;
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
        exportTableAsCsv("REC_TENURE_APP_IMAGE.csv", REC_TENURE_APP_IMAGE_SQL);
      }
      if (shouldExportMfImages(imageExportTarget)) {
        exportTableAsCsvWithoutBinaryColumns("REC_TENURE_MF_IMAGE.csv", REC_TENURE_MF_IMAGE_SQL);
      }
    }

    if (tenureImageObjectUploadEnabled) {
      if (shouldExportAppImages(imageExportTarget)) {
        uploadImageObjectsToS3(REC_TENURE_APP_IMAGE_UPLOAD_SQL, exhibitImagePrefix, "TENURE_APP_IMAGE");
      }
      if (shouldExportMfImages(imageExportTarget)) {
        uploadImageObjectsToS3(REC_TENURE_MF_IMAGE_UPLOAD_SQL, mapImagePrefix, "TENURE_MF_IMAGE");
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
      bindExportTypeCodes(preparedStatement);

      try (ResultSet resultSet = preparedStatement.executeQuery()) {
        ResultSetMetaData metadata = resultSet.getMetaData();
        int blobColumnIndex = findFirstBinaryColumnIndex(metadata);
        if (blobColumnIndex < 0) {
          logger.warn("No BLOB/RAW column found for {} export, skipping object upload", rootPrefix);
          return;
        }

        int forestFileIdColumnIndex = findColumnIndex(metadata, "FOREST_FILE_ID");
        int submissionIdColumnIndex = findColumnIndex(metadata, "SUBMISSION_ID");
        int recResourceIdColumnIndex = findColumnIndex(metadata, "REC_RESOURCE_ID");
        int fileNameColumnIndex = findColumnIndex(metadata, "FILE_NAME", "IMAGE_FILE_NAME", "ATTACHMENT_FILE_NAME");
        int contentTypeColumnIndex = findColumnIndex(metadata, "CONTENT_TYPE", "MIME_TYPE");
        int mapFeatureIdColumnIndex = findColumnIndex(metadata, "MAP_FEATURE_ID");
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
          String forestFileId = sanitizePathSegment(getColumnValue(resultSet, forestFileIdColumnIndex), "");
          String submissionId = sanitizePathSegment(getColumnValue(resultSet, submissionIdColumnIndex), "unknown_submission");
          String recResourceId = sanitizePathSegment(getColumnValue(resultSet, recResourceIdColumnIndex), "");
          String resourceKey = !forestFileId.isBlank() ? forestFileId : (!recResourceId.isBlank() ? recResourceId : "unknown_resource");
          String contentType = getColumnValue(resultSet, contentTypeColumnIndex);
          String stableId = sanitizePathSegment(getColumnValue(resultSet, imageIdColumnIndex), "");
          String defaultFileNameBase = fallbackFilePrefix + "_" + (uploadedRows + 1);
          if (!stableId.isBlank()) {
            defaultFileNameBase = defaultFileNameBase + "_" + stableId;
          }
          String defaultFileName = defaultFileNameBase + extensionFromContentType(contentType);
          String fileName = sanitizeFileName(getColumnValue(resultSet, fileNameColumnIndex), defaultFileName);

          if (!stableId.isBlank() && !fileName.contains(".")) {
            fileName = fileName + "_" + stableId;
          }

          String objectKey;
          if (mapFeatureIdColumnIndex > 0) {
            String mapFeatureId = sanitizePathSegment(getColumnValue(resultSet, mapFeatureIdColumnIndex), "unknown_map_feature");
            objectKey = String.format("%s/%s/%s/%s", sanitizePrefix(rootPrefix), resourceKey, mapFeatureId, fileName);
          } else {
            objectKey = String.format("%s/%s/%s/%s", sanitizePrefix(rootPrefix), resourceKey, submissionId, fileName);
          }
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
    exportTableAsCsv(fileName, sql, true);
  }

  private void exportTableAsCsvWithoutBinaryColumns(String fileName, String sql) {
    exportTableAsCsv(fileName, sql, false);
  }

  private void exportTableAsCsv(String fileName, String sql, boolean includeBinaryColumns) {
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
        bindExportTypeCodes(preparedStatement);

        try (ResultSet resultSet = preparedStatement.executeQuery()) {
          var metadata = resultSet.getMetaData();
          List<Integer> columnIndexes = resolveCsvColumnIndexes(metadata, includeBinaryColumns);
          printHeader(csvPrinter, metadata, columnIndexes);
          csvPrinter.println();

          while (resultSet.next()) {
            printRow(csvPrinter, resultSet, metadata, columnIndexes);
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

  private List<Integer> resolveCsvColumnIndexes(ResultSetMetaData metadata, boolean includeBinaryColumns) throws SQLException {
    List<Integer> columnIndexes = new ArrayList<>();
    for (int columnIndex = 1; columnIndex <= metadata.getColumnCount(); columnIndex++) {
      if (!includeBinaryColumns && isBinaryColumn(metadata, columnIndex)) {
        continue;
      }
      columnIndexes.add(columnIndex);
    }
    return columnIndexes;
  }

  private void printHeader(CSVPrinter csvPrinter, ResultSetMetaData metadata, List<Integer> columnIndexes)
      throws SQLException, IOException {
    for (int columnIndex : columnIndexes) {
      csvPrinter.print(metadata.getColumnName(columnIndex));
    }
  }

  private void printRow(
      CSVPrinter csvPrinter,
      ResultSet resultSet,
      ResultSetMetaData metadata,
      List<Integer> columnIndexes
  ) throws SQLException, IOException {
    for (int columnIndex : columnIndexes) {
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

  private boolean isBinaryColumn(ResultSetMetaData metadata, int columnIndex) throws SQLException {
    return metadata.getColumnType(columnIndex) == Types.BLOB
      || "RAW".equalsIgnoreCase(metadata.getColumnTypeName(columnIndex));
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

  private void bindExportTypeCodes(PreparedStatement preparedStatement) throws SQLException {
    var typeCodes = tenureApplicationService.getExportTypeCodes();
    if (typeCodes.size() != 2) {
      throw new IllegalStateException("Expected exactly 2 tenure application type codes for export");
    }
    preparedStatement.setString(1, typeCodes.get(0));
    preparedStatement.setString(2, typeCodes.get(1));
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

}
