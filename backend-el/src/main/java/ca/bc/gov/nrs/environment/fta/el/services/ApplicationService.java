package ca.bc.gov.nrs.environment.fta.el.services;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccess;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessCode;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccessXref;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationMapFeatureCode;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationMapFeatureGeom;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationMapFeatureXguid;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationAccessCodeRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationAccessRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationAccessXrefRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationMapFeatureCodeRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationMapFeatureGeomRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationMapFeatureRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.RecreationMapFeatureXguidRepository;
import jakarta.persistence.Column;
import software.amazon.awssdk.services.s3.S3Client;

@Service
public class ApplicationService {
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

  public ApplicationService(S3Client s3Client, S3UploaderService s3UploaderService,
      RecreationAccessRepository recreationAccessRepository,
      RecreationAccessCodeRepository recreationAccessCodeRepository,
      RecreationAccessXrefRepository recreationAccessXrefRepository,
      RecreationMapFeatureCodeRepository recreationMapFeatureCodeRepository,
      RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository,
      RecreationMapFeatureRepository recreationMapFeatureRepository,
      RecreationMapFeatureXguidRepository recreationMapFeatureXguidRepository) {
    this.s3UploaderService = s3UploaderService;
    this.recreationAccessRepository = recreationAccessRepository;
    this.recreationAccessCodeRepository = recreationAccessCodeRepository;
    this.recreationAccessXrefRepository = recreationAccessXrefRepository;
    this.recreationMapFeatureCodeRepository = recreationMapFeatureCodeRepository;
    this.recreationMapFeatureGeomRepository = recreationMapFeatureGeomRepository;
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
