package ca.bc.gov.nrs.environment.fta.el.services;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccess;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessCode;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessXref;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationAccessCodeRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationAccessRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationAccessXrefRepository;
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

  public ApplicationService(S3Client s3Client, RecreationAccessRepository recreationAccessRepository, RecreationAccessCodeRepository recreationAccessCodeRepository, RecreationAccessXrefRepository recreationAccessXrefRepository/*, RecreationActivityCodeRepository recreationActivityCodeRepository, RecreationActivityRepository recreationActivityRepository, RecreationAgreementHolderRepository recreationAgreementHolderRepository, RecreationAttachmentContentRepository recreationAttachmentContentRepository, RecreationAttachmentRepository recreationAttachmentRepository, RecreationCommentRepository recreationCommentRepository, RecreationControlAccessCodeRepository recreationControlAccessCodeRepository, RecreationDefCsRprHistoryRepository recreationDefCsRprHistoryRepository, RecreationDefinedCampsiteRepository recreationDefinedCampsiteRepository, RecreationDistrictCodeRepository recreationDistrictCodeRepository, RecreationDistrictXrefRepository recreationDistrictXrefRepository, RecreationFeeCodeRepository recreationFeeCodeRepository, RecreationFeatureCodeRepository recreationFeatureCodeRepository, RecreationFeeRepository recreationFeeRepository, RecreationFileStatusCodeRepository recreationFileStatusCodeRepository, RecreationFileTypeCodeRepository recreationFileTypeCodeRepository, RecreationInspectionReportRepository recreationInspectionReportRepository, RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository*/) {
    this.s3Client = s3Client;
    this.recreationAccessRepository = recreationAccessRepository;
    this.recreationAccessCodeRepository = recreationAccessCodeRepository;
    this.recreationAccessXrefRepository = recreationAccessXrefRepository;
    /*this.recreationActivityCodeRepository = recreationActivityCodeRepository;
    this.recreationActivityRepository = recreationActivityRepository;
    this.recreationAgreementHolderRepository = recreationAgreementHolderRepository;
    this.recreationAttachmentContentRepository = recreationAttachmentContentRepository;
    this.recreationAttachmentRepository = recreationAttachmentRepository;
    this.recreationCommentRepository = recreationCommentRepository;
    this.recreationControlAccessCodeRepository = recreationControlAccessCodeRepository;
    this.recreationDefCsRprHistoryRepository = recreationDefCsRprHistoryRepository;
    this.recreationDefinedCampsiteRepository = recreationDefinedCampsiteRepository;
    this.recreationDistrictCodeRepository = recreationDistrictCodeRepository;
    this.recreationDistrictXrefRepository = recreationDistrictXrefRepository;
    this.recreationFeeCodeRepository = recreationFeeCodeRepository;
    this.recreationFeatureCodeRepository = recreationFeatureCodeRepository;
    this.recreationFeeRepository = recreationFeeRepository;
    this.recreationFileStatusCodeRepository = recreationFileStatusCodeRepository;
    this.recreationFileTypeCodeRepository = recreationFileTypeCodeRepository;
    this.recreationInspectionReportRepository = recreationInspectionReportRepository;
    this.recreationMapFeatureGeomRepository = recreationMapFeatureGeomRepository;*/

  }

  public void extractAndUploadCSVToS3() {
    extractAndUploadRecreationAccessCode();
    extractAndUploadRecreationAccess();
    extractAndUploadRecreationAccessXref();
  }

  private void extractAndUploadRecreationAccessXref() {
    var results = this.recreationAccessXrefRepository.findAll();
    var fileName = "recreation-access-xref.csv";
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
    var fileName = "recreation-access-code.csv";
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
    var fileName = "recreation-access.csv";
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
