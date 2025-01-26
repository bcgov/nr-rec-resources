package ca.bc.gov.nrs.environment.fta.el.services;

import ca.bc.gov.nrs.environment.fta.el.entities.*;
import ca.bc.gov.nrs.environment.fta.el.repositories.*;
import jakarta.persistence.Column;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApplicationService {
  @Value("${ca.bc.gov.nrs.environment.fta.el.file-base-path}")
  private String fileBasePath;
  @Value("${ca.bc.gov.nrs.environment.fta.el.s3.bucket}")
  private String bucket;
  private final S3Client s3Client;
  // Add all the repositories as final members
  private final RecreationAccessCodeRepository recreationAccessCodeRepository;
  private final RecreationAccessRepository recreationAccessRepository;
  private final RecreationAccessXrefRepository recreationAccessXrefRepository;
  private final RecreationMapFeatureCodeRepository recreationMapFeatureCodeRepository;
  private final RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository;
  private final RecreationMapFeatureRepository recreationMapFeatureRepository;
  private final RecreationMapFeatureXguidRepository recreationMapFeatureXguidRepository;
  /*private final RecreationActivityCodeRepository recreationActivityCodeRepository;
  private final RecreationActivityRepository recreationActivityRepository;
  private final RecreationAgreementHolderRepository recreationAgreementHolderRepository;
  private final RecreationAttachmentContentRepository recreationAttachmentContentRepository;
  private final RecreationAttachmentRepository recreationAttachmentRepository;
  private final RecreationCommentRepository recreationCommentRepository;
  private final RecreationControlAccessCodeRepository recreationControlAccessCodeRepository;
  private final RecreationDefCsRprHistoryRepository recreationDefCsRprHistoryRepository;
  private final RecreationDefinedCampsiteRepository recreationDefinedCampsiteRepository;
  private final RecreationDistrictCodeRepository recreationDistrictCodeRepository;
  private final RecreationDistrictXrefRepository recreationDistrictXrefRepository;
  private final RecreationFeeCodeRepository recreationFeeCodeRepository;
  private final RecreationFeatureCodeRepository recreationFeatureCodeRepository;
  private final RecreationFeeRepository recreationFeeRepository;
  private final RecreationFileStatusCodeRepository recreationFileStatusCodeRepository;
  private final RecreationFileTypeCodeRepository recreationFileTypeCodeRepository;
  private final RecreationInspectionReportRepository recreationInspectionReportRepository;

  private final RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository;*/

  public ApplicationService(S3Client s3Client, RecreationAccessRepository recreationAccessRepository, RecreationAccessCodeRepository recreationAccessCodeRepository, RecreationAccessXrefRepository recreationAccessXrefRepository, RecreationMapFeatureCodeRepository recreationMapFeatureCodeRepository, RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository, RecreationMapFeatureRepository recreationMapFeatureRepository, RecreationMapFeatureXguidRepository recreationMapFeatureXguidRepository) {
    this.s3Client = s3Client;
    this.recreationAccessRepository = recreationAccessRepository;
    this.recreationAccessCodeRepository = recreationAccessCodeRepository;
    this.recreationAccessXrefRepository = recreationAccessXrefRepository;
    this.recreationMapFeatureCodeRepository = recreationMapFeatureCodeRepository;
    this.recreationMapFeatureGeomRepository = recreationMapFeatureGeomRepository;
    this.recreationMapFeatureRepository = recreationMapFeatureRepository;
    this.recreationMapFeatureXguidRepository = recreationMapFeatureXguidRepository;
  }

  public void extractAndUploadCSVToS3() {
    extractAndUploadRecreationAccessCode();
    extractAndUploadRecreationAccess();
    extractAndUploadRecreationAccessXref();
    extractAndUploadRecreationMapFeatureXguid();
    extractAndUploadRecreationMapFeatureCode();
    extractAndUploadRecreationMapFeatureGeom();
  }

  private void extractAndUploadRecreationMapFeatureGeom() {
    var results = this.recreationMapFeatureGeomRepository.findAll();
    var entityName = RecreationMapFeatureGeom.class.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : RecreationMapFeatureGeom.class.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));
    try (
      FileWriter out = new FileWriter(filePath);
      CSVPrinter printer = new CSVPrinter(out, csvFormatBuilder.build());
    ) {

      for (var item : results) {
        printer.printRecord(item.getId(), item.getGeometryTypeCode(), item.getMapFeatureId(), item.getFeatureArea(), item.getFeatureLength(), item.getFeaturePerimeter(), item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(), item
          .getUpdateTimestamp(),item.getGeometry());
      }
      printer.flush();
      uploadFileToS3(filePath, fileName);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationMapFeatureCode() {
    var results = this.recreationMapFeatureCodeRepository.findAll();
    var entityName = RecreationMapFeatureCode.class.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : RecreationMapFeatureCode.class.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));
    try (
      FileWriter out = new FileWriter(filePath);
      CSVPrinter printer = new CSVPrinter(out, csvFormatBuilder.build());
    ) {

      for (var item : results) {
        printer.printRecord(item.getRecreationMapFeatureCode(), item.getDescription(), item.getEffectiveDate(), item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      uploadFileToS3(filePath, fileName);

    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationMapFeatureXguid() {
    var results = this.recreationMapFeatureXguidRepository.findAll();
    var entityName = RecreationMapFeatureXguid.class.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : RecreationMapFeatureXguid.class.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));

    try (
      FileWriter out = new FileWriter(filePath);
      CSVPrinter printer = new CSVPrinter(out, csvFormatBuilder.build());
    ) {

      for (var item : results) {
        printer.printRecord(item.getId(), item.getRmfSkey());
      }
      printer.flush();
      uploadFileToS3(filePath, fileName);

    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationAccessXref() {
    var results = this.recreationAccessXrefRepository.findAll();
    var entityName = RecreationAccessXref.class.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : RecreationAccessXref.class.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));

    try (
      FileWriter out = new FileWriter(filePath);
      CSVPrinter printer = new CSVPrinter(out, csvFormatBuilder.build());
    ) {

      for (var item : results) {
        printer.printRecord(item.getRecreationAccessCode(), item.getRecreationSubAccessCode(), item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      uploadFileToS3(filePath, fileName);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }


  private void extractAndUploadRecreationAccessCode() {
    var results = this.recreationAccessCodeRepository.findAll();
    var entityName = RecreationAccessCode.class.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : RecreationAccessCode.class.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));

    try (
      FileWriter out = new FileWriter(filePath);
      CSVPrinter printer = new CSVPrinter(out, csvFormatBuilder.build());
    ) {

      for (var item : results) {
        printer.printRecord(item.getRecreationAccessCode(), item.getDescription(), item.getEffectiveDate(), item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      uploadFileToS3(filePath, fileName);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationAccess() {
    var results = this.recreationAccessRepository.findAll();
    var entityName = RecreationAccess.class.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : RecreationAccess.class.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));

    try (
      FileWriter out = new FileWriter(filePath);
      CSVPrinter printer = new CSVPrinter(out, csvFormatBuilder.build());
    ) {

      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecreationSubAccessCode(), item.getRecreationAccessCode(), item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      uploadFileToS3(filePath, fileName);

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void uploadFileToS3(String filePath, String fileName) {
    try {

      var file = new File(filePath);
      var putObjectRequest = PutObjectRequest.builder()
        .bucket(bucket)
        .key(bucket + "/uploads/" + fileName)
        .build();
      this.s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromFile(file));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
