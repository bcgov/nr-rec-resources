package ca.bc.gov.nrs.environment.fta.el.services;

import ca.bc.gov.nrs.environment.fta.el.entities.*;
import ca.bc.gov.nrs.environment.fta.el.repositories.*;
import jakarta.persistence.Column;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApplicationService {
  private final Logger logger = LoggerFactory.getLogger(ApplicationService.class);
  @Value("${ca.bc.gov.nrs.environment.fta.el.file-base-path}")
  private String fileBasePath;
  @Value("${ca.bc.gov.nrs.environment.fta.el.s3.bucket}")
  private String bucket;
  private final S3UploaderService s3UploaderService;
  // Add all the repositories as final members
  private final RecreationAccessCodeRepository recreationAccessCodeRepository;
  private final RecreationAccessRepository recreationAccessRepository;
  private final RecreationAccessXrefRepository recreationAccessXrefRepository;
  private final RecreationMapFeatureCodeRepository recreationMapFeatureCodeRepository;
  private final RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository;
  private final RecreationMapFeatureXguidRepository recreationMapFeatureXguidRepository;
  private final RecreationActivityCodeRepository recreationActivityCodeRepository;
  private final RecreationActivityRepository recreationActivityRepository;
  private final RecreationAgreementHolderRepository recreationAgreementHolderRepository;
  private final RecreationAttachmentRepository recreationAttachmentRepository;
  private final RecreationAttachmentContentRepository recreationAttachmentContentRepository;

  public ApplicationService(S3Client s3Client, S3UploaderService s3UploaderService,
      RecreationAccessRepository recreationAccessRepository,
      RecreationAccessCodeRepository recreationAccessCodeRepository,
      RecreationAccessXrefRepository recreationAccessXrefRepository,
      RecreationMapFeatureCodeRepository recreationMapFeatureCodeRepository,
      RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository,
      RecreationMapFeatureRepository recreationMapFeatureRepository,
      RecreationMapFeatureXguidRepository recreationMapFeatureXguidRepository,
      RecreationActivityCodeRepository recreationActivityCodeRepository,
      RecreationActivityRepository recreationActivityRepository,
      RecreationAgreementHolderRepository recreationAgreementHolderRepository,
      RecreationAttachmentRepository recreationAttachmentRepository,
      RecreationAttachmentContentRepository recreationAttachmentContentRepository) {
    this.s3UploaderService = s3UploaderService;
    this.recreationAccessRepository = recreationAccessRepository;
    this.recreationAccessCodeRepository = recreationAccessCodeRepository;
    this.recreationAccessXrefRepository = recreationAccessXrefRepository;
    this.recreationMapFeatureCodeRepository = recreationMapFeatureCodeRepository;
    this.recreationMapFeatureGeomRepository = recreationMapFeatureGeomRepository;
    this.recreationMapFeatureXguidRepository = recreationMapFeatureXguidRepository;
    this.recreationActivityCodeRepository = recreationActivityCodeRepository;
    this.recreationActivityRepository = recreationActivityRepository;
    this.recreationAgreementHolderRepository = recreationAgreementHolderRepository;
    this.recreationAttachmentRepository = recreationAttachmentRepository;
    this.recreationAttachmentContentRepository = recreationAttachmentContentRepository;
  }

  public void extractAndUploadCSVToS3() {
    extractAndUploadRecreationAccessCode();
    extractAndUploadRecreationAccess();
    extractAndUploadRecreationAccessXref();
    extractAndUploadRecreationActivity();
    extractAndUploadRecreationActivityCode();
    extractAndUploadRecreationAgreementHolder();
    var recAttachments = extractAndUploadRecreationAttachment();
    extractAndUploadRecreationAttachmentContent(recAttachments);
    extractAndUploadRecreationMapFeatureXguid();
    extractAndUploadRecreationMapFeatureCode();
    extractAndUploadRecreationMapFeatureGeom();
  }

  /**
   * This method is special as it upload the attachment contents into its own
   * forest file id as path.
   *
   * @param recAttachments all the attachment objects from db
   */
  private void extractAndUploadRecreationAttachmentContent(final List<RecreationAttachment> recAttachments) {
    for (var recAttachment : recAttachments) {
      // for each attachment, check if it is already present in s3, if not query db
      // and upload.
      var filePath = String.format("uploads/attachments/%s", recAttachment.getForestFileId());
      var fileName = recAttachment.getAttachmentFileName();
      var fileExists = this.s3UploaderService.checkIfFileExistInTheBucketPath(filePath, fileName);
      if (fileExists) {
        logger.debug("File exists in S3 bucket {} {}", filePath, fileName);
      } else {
        // directly upload to s3
        var contentId = new RecreationAttachmentContentId();
        contentId.setRecreationAttachmentId(recAttachment.getRecreationAttachmentId());
        contentId.setForestFileId(recAttachment.getForestFileId());
        var attachmentContentOptional = this.recreationAttachmentContentRepository.findById(contentId);
        if (attachmentContentOptional.isPresent()) {
          var attachmentContent = attachmentContentOptional.get();
          // upload the byte array to s3 directly using file path file name and byte
          // array.
          this.s3UploaderService.uploadBytesToS3(filePath, fileName, attachmentContent.getAttachmentContent());
        } else {
          logger.warn("File does not exist in database {} {}", filePath, fileName);
        }
      }
    }
  }

  private List<RecreationAttachment> extractAndUploadRecreationAttachment() {
    var results = this.recreationAttachmentRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationAttachment.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecreationAttachmentId(), item.getAttachmentFileName(),
            item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
    return results;
  }

  private void extractAndUploadRecreationAgreementHolder() {
    var results = this.recreationAgreementHolderRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationAgreementHolder.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getForestFile(), item.getClientNumber(),
            item.getClientLocationCode(), item.getAgreementStartDate(), item.getAgreementEndDate(),
            item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationActivityCode() {
    var results = this.recreationActivityCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationActivityCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationActivityCode(), item.getDescription(), item.getEffectiveDate(),
            item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationActivity() {
    var results = this.recreationActivityRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationActivity.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecreationActivityCode(), item.getActivityRank(),
            item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationMapFeatureGeom() {
    var results = this.recreationMapFeatureGeomRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationMapFeatureGeom.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getGeometryTypeCode(), item.getMapFeatureId(), item.getFeatureArea(),
            item.getFeatureLength(), item.getFeaturePerimeter(), item.getRevisionCount(), item.getEntryUserid(),
            item.getEntryTimestamp(), item.getUpdateUserid(), item
                .getUpdateTimestamp(),
            item.getGeometry());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationMapFeatureCode() {
    var results = this.recreationMapFeatureCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationMapFeatureCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationMapFeatureCode(), item.getDescription(), item.getEffectiveDate(),
            item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationMapFeatureXguid() {
    var results = this.recreationMapFeatureXguidRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationMapFeatureXguid.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getRmfSkey());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationAccessXref() {
    var results = this.recreationAccessXrefRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationAccessXref.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationAccessCode(), item.getRecreationSubAccessCode(), item.getRevisionCount(),
            item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationAccessCode() {
    var results = this.recreationAccessCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationAccessCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {

      for (var item : results) {
        printer.printRecord(item.getRecreationAccessCode(), item.getDescription(), item.getEffectiveDate(),
            item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationAccess() {
    var results = this.recreationAccessRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationAccess.class);
    try (
        FileWriter out = new FileWriter(entityMetadata.filePath());
        CSVPrinter printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {

      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecreationSubAccessCode(), item.getRecreationAccessCode(),
            item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(), item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());

    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private EntityMetadata getEntityMetadata(Class<?> clazz) {
    var entityName = clazz.getSimpleName();
    var fileName = entityName.replaceAll("([a-z])([A-Z]+)", "$1_$2").toUpperCase() + ".csv";
    var filePath = fileBasePath + "/" + fileName;
    var csvFormatBuilder = CSVFormat.DEFAULT.builder();
    List<String> headerNames = new ArrayList<>();
    for (var field : clazz.getDeclaredFields()) {
      field.setAccessible(true);
      var annotation = field.getAnnotation(Column.class);
      if (annotation != null) {
        var headerName = field.getDeclaredAnnotation(Column.class).name();
        headerNames.add(headerName);
      }
    }
    csvFormatBuilder.setHeader(headerNames.toArray(new String[0]));
    return new EntityMetadata(fileName, filePath, csvFormatBuilder);
  }

  private record EntityMetadata(String fileName, String filePath, CSVFormat.Builder csvFormatBuilder) {
  }
}
