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
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;

@Service
public class TenureExportService {

  private static final String TYPE_CODE_RL = "RL";
  private static final String TYPE_CODE_RPO = "RPO";

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

  public TenureExportService(DataSource dataSource, S3UploaderService s3UploaderService) {
    this.dataSource = dataSource;
    this.s3UploaderService = s3UploaderService;
  }

  public void extractAndUploadTenureDataToS3() {
    ensureOutputDirectoryExists();

    exportTableAsCsv("REC_TENURE_APPLICATION.csv", REC_TENURE_APPLICATION_SQL);
    exportTableAsCsv("REC_TENURE_MAP_FEATURE.csv", REC_TENURE_MAP_FEATURE_SQL);
    exportTableAsCsv("REC_TENURE_APP_IMAGE.csv", REC_TENURE_APP_IMAGE_SQL);
    exportTableAsCsv("REC_TENURE_MF_IMAGE.csv", REC_TENURE_MF_IMAGE_SQL);
  }

  private void exportTableAsCsv(String fileName, String sql) {
    Path outputPath = Path.of(fileBasePath, fileName);

    try (
      Connection connection = dataSource.getConnection();
      PreparedStatement preparedStatement = connection.prepareStatement(sql);
      FileWriter fileWriter = new FileWriter(outputPath.toFile());
      CSVPrinter csvPrinter = new CSVPrinter(fileWriter, CSVFormat.DEFAULT)
    ) {
      preparedStatement.setFetchSize(500);
      preparedStatement.setString(1, TYPE_CODE_RL);
      preparedStatement.setString(2, TYPE_CODE_RPO);

      try (ResultSet resultSet = preparedStatement.executeQuery()) {
        var metadata = resultSet.getMetaData();
        printHeader(csvPrinter, metadata);
        csvPrinter.println();

        long rows = 0;
        while (resultSet.next()) {
          printRow(csvPrinter, resultSet, metadata);
          rows++;
        }

        csvPrinter.flush();
        s3UploaderService.uploadFileToS3(outputPath.toString(), fileName);
        logger.info("Exported {} rows to {} and uploaded as {}", rows, outputPath, fileName);
      }
    } catch (Exception e) {
      throw new RuntimeException("Failed to export table for file " + fileName, e);
    }
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

      csvPrinter.print(serializeValue(value));
    }
    csvPrinter.println();
  }

  private String serializeValue(Object value) {
    if (value == null) {
      return null;
    }

    if (value instanceof byte[] byteArray) {
      return toHex(byteArray);
    }

    return String.valueOf(value);
  }

  private String toHex(byte[] bytes) {
    StringBuilder builder = new StringBuilder(bytes.length * 2);
    for (byte b : bytes) {
      builder.append(String.format("%02x", b));
    }
    return builder.toString();
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
}

