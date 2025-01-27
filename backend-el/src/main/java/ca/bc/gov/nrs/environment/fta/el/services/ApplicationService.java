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

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApplicationService {
  private final Logger logger = LoggerFactory.getLogger(ApplicationService.class);
  @Value("${ca.bc.gov.nrs.environment.fta.el.file-base-path}")
  private String fileBasePath;
  private final S3UploaderService s3UploaderService;
  // Add all the repositories as final members
  private final RecreationAccessCodeRepository recreationAccessCodeRepository;
  private final RecreationAccessRepository recreationAccessRepository;
  private final RecreationActivityCodeRepository recreationActivityCodeRepository;
  private final RecreationActivityRepository recreationActivityRepository;
  private final RecreationAccessXrefRepository recreationAccessXrefRepository;
  private final RecreationAgreementHolderRepository recreationAgreementHolderRepository;
  private final RecreationAttachmentContentRepository recreationAttachmentContentRepository;
  private final RecreationAttachmentRepository recreationAttachmentRepository;
  private final RecreationCommentRepository recreationCommentRepository;
  private final RecreationControlAccessCodeRepository recreationControlAccessCodeRepository;
  private final RecreationDefCsRprHistoryRepository recreationDefCsRprHistoryRepository;
  private final RecreationDefinedCampsiteRepository recreationDefinedCampsiteRepository;
  private final RecreationDistrictCodeRepository recreationDistrictCodeRepository;
  private final RecreationDistrictXrefRepository recreationDistrictXrefRepository;
  private final RecreationFeatureCodeRepository recreationFeatureCodeRepository;
  private final RecreationFeeCodeRepository recreationFeeCodeRepository;
  private final RecreationFeeRepository recreationFeeRepository;
  private final RecreationFileStatusCodeRepository recreationFileStatusCodeRepository;
  private final RecreationFileTypeCodeRepository recreationFileTypeCodeRepository;
  private final RecreationInspectionReportRepository recreationInspectionReportRepository;
  private final RecreationMaintainStdCodeRepository recreationMaintainStdCodeRepository;
  private final RecreationMapFeatureCodeRepository recreationMapFeatureCodeRepository;
  private final RecreationMapFeatureGeomRepository recreationMapFeatureGeomRepository;
  private final RecreationMapFeatureRepository recreationMapFeatureRepository;
  private final RecreationMapFeatureXguidRepository recreationMapFeatureXguidRepository;
  private final RecreationObjectiveRepository recreationObjectiveRepository;
  private final RecreationOccupancyCodeRepository recreationOccupancyCodeRepository;
  private final RecreationPlanRepository recreationPlanRepository;
  private final RecreationProjectRepository recreationProjectRepository;
  private final RecreationRemedRepairCodeRepository recreationRemedRepairCodeRepository;
  private final RecreationRiskEvaluationRepository recreationRiskEvaluationRepository;
  private final RecreationRiskRatingCodeRepository recreationRiskRatingCodeRepository;
  private final RecreationRiskSiteRepository recreationRiskSiteRepository;
  private final RecreationSearchResultRepository recreationSearchResultRepository;
  private final RecreationSitePointRepository recreationSitePointRepository;
  private final RecreationSiteRepository recreationSiteRepository;
  private final RecreationStructDimenCodeRepository recreationStructDimenCodeRepository;
  private final RecreationStructDimenXrefRepository recreationStructDimenXrefRepository;
  private final RecreationStructureCodeRepository recreationStructureCodeRepository;
  private final RecreationStructureRepository recreationStructureRepository;
  private final RecreationStructureValueRepository recreationStructureValueRepository;
  private final RecreationSubAccessCodeRepository recreationSubAccessCodeRepository;
  private final RecreationTrailSegmentRepository recreationTrailSegmentRepository;
  private final RecreationUserDaysCodeRepository recreationUserDaysCodeRepository;
  private final RecreatnEventRepository recreatnEventRepository;

  public ApplicationService(S3UploaderService s3UploaderService,
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
      RecreationAttachmentContentRepository recreationAttachmentContentRepository,
      RecreationCommentRepository recreationCommentRepository,
      RecreationControlAccessCodeRepository recreationControlAccessCodeRepository,
      RecreationDefCsRprHistoryRepository recreationDefCsRprHistoryRepository,
      RecreationDefinedCampsiteRepository recreationDefinedCampsiteRepository,
      RecreationDistrictCodeRepository recreationDistrictCodeRepository,
      RecreationDistrictXrefRepository recreationDistrictXrefRepository,
      RecreationFeatureCodeRepository recreationFeatureCodeRepository,
      RecreationFeeCodeRepository recreationFeeCodeRepository,
      RecreationFeeRepository recreationFeeRepository,
      RecreationFileStatusCodeRepository recreationFileStatusCodeRepository,
      RecreationFileTypeCodeRepository recreationFileTypeCodeRepository,
      RecreationInspectionReportRepository recreationInspectionReportRepository,
      RecreationMaintainStdCodeRepository recreationMaintainStdCodeRepository,
      RecreationMapFeatureRepository recreationMapFeatureRepository1,
      RecreationObjectiveRepository recreationObjectiveRepository,
      RecreationOccupancyCodeRepository recreationOccupancyCodeRepository,
      RecreationPlanRepository recreationPlanRepository,
      RecreationProjectRepository recreationProjectRepository,
      RecreationRemedRepairCodeRepository recreationRemedRepairCodeRepository,
      RecreationRiskEvaluationRepository recreationRiskEvaluationRepository,
      RecreationRiskRatingCodeRepository recreationRiskRatingCodeRepository,
      RecreationRiskSiteRepository recreationRiskSiteRepository,
      RecreationSearchResultRepository recreationSearchResultRepository,
      RecreationSitePointRepository recreationSitePointRepository,
      RecreationSiteRepository recreationSiteRepository,
      RecreationStructDimenCodeRepository recreationStructDimenCodeRepository,
      RecreationStructDimenXrefRepository recreationStructDimenXrefRepository,
      RecreationStructureCodeRepository recreationStructureCodeRepository,
      RecreationStructureRepository recreationStructureRepository,
      RecreationStructureValueRepository recreationStructureValueRepository,
      RecreationSubAccessCodeRepository recreationSubAccessCodeRepository,
      RecreationTrailSegmentRepository recreationTrailSegmentRepository,
      RecreationUserDaysCodeRepository recreationUserDaysCodeRepository,
      RecreatnEventRepository recreatnEventRepository) {
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
    this.recreationCommentRepository = recreationCommentRepository;
    this.recreationControlAccessCodeRepository = recreationControlAccessCodeRepository;
    this.recreationDefCsRprHistoryRepository = recreationDefCsRprHistoryRepository;
    this.recreationDefinedCampsiteRepository = recreationDefinedCampsiteRepository;
    this.recreationDistrictCodeRepository = recreationDistrictCodeRepository;
    this.recreationDistrictXrefRepository = recreationDistrictXrefRepository;
    this.recreationFeatureCodeRepository = recreationFeatureCodeRepository;
    this.recreationFeeCodeRepository = recreationFeeCodeRepository;
    this.recreationFeeRepository = recreationFeeRepository;
    this.recreationFileStatusCodeRepository = recreationFileStatusCodeRepository;
    this.recreationFileTypeCodeRepository = recreationFileTypeCodeRepository;
    this.recreationInspectionReportRepository = recreationInspectionReportRepository;
    this.recreationMaintainStdCodeRepository = recreationMaintainStdCodeRepository;
    this.recreationMapFeatureRepository = recreationMapFeatureRepository1;
    this.recreationObjectiveRepository = recreationObjectiveRepository;
    this.recreationOccupancyCodeRepository = recreationOccupancyCodeRepository;
    this.recreationPlanRepository = recreationPlanRepository;
    this.recreationProjectRepository = recreationProjectRepository;
    this.recreationRemedRepairCodeRepository = recreationRemedRepairCodeRepository;
    this.recreationRiskEvaluationRepository = recreationRiskEvaluationRepository;
    this.recreationRiskRatingCodeRepository = recreationRiskRatingCodeRepository;
    this.recreationRiskSiteRepository = recreationRiskSiteRepository;
    this.recreationSearchResultRepository = recreationSearchResultRepository;
    this.recreationSitePointRepository = recreationSitePointRepository;
    this.recreationSiteRepository = recreationSiteRepository;
    this.recreationStructDimenCodeRepository = recreationStructDimenCodeRepository;
    this.recreationStructDimenXrefRepository = recreationStructDimenXrefRepository;
    this.recreationStructureCodeRepository = recreationStructureCodeRepository;
    this.recreationStructureRepository = recreationStructureRepository;
    this.recreationStructureValueRepository = recreationStructureValueRepository;
    this.recreationSubAccessCodeRepository = recreationSubAccessCodeRepository;
    this.recreationTrailSegmentRepository = recreationTrailSegmentRepository;
    this.recreationUserDaysCodeRepository = recreationUserDaysCodeRepository;
    this.recreatnEventRepository = recreatnEventRepository;
  }

  public void extractAndUploadCSVToS3() {
    extractAndUploadRecreationAccess();
    extractAndUploadRecreationAccessCode();
    extractAndUploadRecreationAccessXref();
    extractAndUploadRecreationActivity();
    extractAndUploadRecreationActivityCode();
    extractAndUploadRecreationAgreementHolder();
    var recAttachments = extractAndUploadRecreationAttachment();
    extractAndUploadRecreationAttachmentContent(recAttachments);
    extractAndUploadRecreationComment();
    extractAndUploadRecreationControlAccessCode();
    extractAndUploadRecreationDefCsRprHistory();
    extractAndUploadRecreationDefinedCampsite();
    extractAndUploadRecreationDistrictCode();
    extractAndUploadRecreationDistrictXref();
    extractAndUploadRecreationFeatureCode();
    extractAndUploadRecreationFeeCode();
    extractAndUploadRecreationFee();
    extractAndUploadRecreationFileStatusCode();
    extractAndUploadRecreationFileTypeCode();
    extractAndUploadRecreationInspectionReport();
    extractAndUploadRecreationMaintainStdCode();
    extractAndUploadRecreationMapFeature();
    extractAndUploadRecreationMapFeatureCode();
    extractAndUploadRecreationMapFeatureGeom();
    extractAndUploadRecreationMapFeatureXguid();
    extractAndUploadRecreationObjective();
    extractAndUploadRecreationOccupancyCode();
    extractAndUploadRecreationPlan();
    extractAndUploadRecreationProject();
    extractAndUploadRecreationRemedRepairCode();
    extractAndUploadRecreationRiskEvaluation();
    extractAndUploadRecreationRiskRatingCode();
    extractAndUploadRecreationRiskSite();
    extractAndUploadRecreationSearchResult();
    extractAndUploadRecreationSitePoint();
    extractAndUploadRecreationSite();
    extractAndUploadRecreationStructDimenCode();
    extractAndUploadRecreationStructDimenXref();
    extractAndUploadRecreationStructureCode();
    extractAndUploadRecreationStructure();
    extractAndUploadRecreationStructureValue();
    extractAndUploadRecreationSubAccessCode();
    extractAndUploadRecreationTrailSegment();
    extractAndUploadRecreationUserDaysCode();
    extractAndUploadRecreatnEvent();
  }

  private void extractAndUploadRecreationMapFeature() {
    var results = this.recreationMapFeatureRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationMapFeature.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getSectionId(),
            item.getAmendmentId(),
            item.getRecreationMapFeatureCode(), item.getCurrentInd(),
            item.getAmendStatusDate(), item.getRetirementDate(),
            item.getRevisionCount(), item.getEntryUserid(),
            item.getEntryTimestamp(), item.getUpdateUserid(),
            item.getUpdateTimestamp(), item.getRecreationMapFeatureGuid());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreatnEvent() {
    var results = this.recreatnEventRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreatnEvent.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getOrgUnitNo(), item.getForestFileId(),
            item.getRecProjectId(), item.getEventTypeCode(), item.getEntryTimestamp(),
            item.getDistrictAdmnZone(), item.getEventDueDate(), item.getEventDate(),
            item.getEventRemarks(), item.getWorkAssignmentCd(), item.getEnteredBy());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationUserDaysCode() {
    var results = this.recreationUserDaysCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationUserDaysCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationUserDaysCode(), item.getDescription(),
            item.getEffectiveDate(), item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationTrailSegment() {
    var results = this.recreationTrailSegmentRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationTrailSegment.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecreationTrailSegId(),
            item.getTrailSegmentName(), item.getStartStation(),
            item.getEndStation(), item.getRecreationRemedRepairCode(),
            item.getEstimatedRepairCost(), item.getActualRepairCost(),
            item.getRepairCompletedDate(), item.getWheelchairAccessibleInd(),
            item.getRevisionCount(), item.getEntryUserid(), item.getEntryTimestamp(),
            item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationSubAccessCode() {
    var results = this.recreationSubAccessCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationSubAccessCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationSubAccessCode(), item.getDescription(),
            item.getEffectiveDate(), item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationStructureValue() {
    var results = this.recreationStructureValueRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationStructureValue.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationStructureCode(), item.getStructureValue(),
            item.getDimension(),
            item.getRevisionCount(), item.getEntryUserid(),
            item.getEntryTimestamp(), item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationStructure() {
    var results = this.recreationStructureRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationStructure.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getForestFile(), item.getCampSiteForestFileId(),
            item.getRecreationStructureCode(), item.getStructureName(),
            item.getStructureCount(), item.getStructureLength(),
            item.getStructureWidth(), item.getStructureArea(),
            item.getActualValue(), item.getCampSiteNumber(), item.getRecreationRemedRepairCode(),
            item.getEstimatedRepairCost(), item.getRepairCompletedDate(),
            item.getRevisionCount(),
            item.getEntryUserid(),
            item.getUpdateUserid(), item.getUpdateTimestamp(), item.getEntryTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationStructureCode() {
    var results = this.recreationStructureCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationStructureCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationStructureCode(),
            item.getDescription(), item.getEffectiveDate(), item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationStructDimenXref() {
    var results = this.recreationStructDimenXrefRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationStructDimenXref.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationStructureCode(),
            item.getRecreationStructDimenCode(), item.getRevisionCount(),
            item.getEntryUserid(), item.getEntryTimestamp(),
            item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationStructDimenCode() {
    var results = this.recreationStructDimenCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationStructDimenCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationStructDimenCode(),
            item.getDescription(), item.getEffectiveDate(), item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationSite() {
    var results = this.recreationSiteRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationSite.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecSiteName());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationSitePoint() {
    var results = this.recreationSitePointRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationSitePoint.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRevisionCount(),
            item.getEntryUserid(), item.getEntryTimestamp(),
            item.getUpdateUserid(), item.getUpdateTimestamp(),
            item.getGeometry());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationSearchResult() {
    var results = this.recreationSearchResultRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationSearchResult.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getOrgUnitCode(), item.getOrgUnitName(),
            item.getFileStatusCode(), item.getProjectName(), item.getProjectType(),
            item.getRecreationProjectCode(), item.getRecreationProjectCodeDesc());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationRiskSite() {

    var results = this.recreationRiskSiteRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationRiskSite.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getForestFile(), item.getEntryTimestamp(),
            item.getEntryUserid(),
            item.getUpdateTimestamp(), item.getUpdateUserid());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationRiskRatingCode() {
    var results = this.recreationRiskRatingCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationRiskRatingCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationRiskRatingCode(),
            item.getDescription(), item.getEffectiveDate(),
            item.getExpiryDate(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationRiskEvaluation() {
    var results = this.recreationRiskEvaluationRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationRiskEvaluation.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getRecreationUserDaysCode(),
            item.getRecreationOccupancyCode(), item.getEntryTimestamp(),
            item.getEntryUserid(), item.getUpdateTimestamp(),
            item.getUpdateUserid());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationRemedRepairCode() {
    var results = this.recreationRemedRepairCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationRemedRepairCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationRemedRepairCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationProject() {
    var results = this.recreationProjectRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationProject.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getProjectName(),
            item.getRecreationControlAccessCode(), item.getRecreationFeatureCode(),
            item.getRecreationMaintainStdCode(), item.getRecreationRiskRatingCode(),
            item.getUtmZone(), item.getLastRecInspectionDate(),
            item.getRecProjectSkey(), item.getResourceFeatureInd(),
            item.getLastHzrdTreeAssessDate(), item.getSiteDescription(),
            item.getRecreationUserDaysCode(), item.getOverflowCampsites(),
            item.getUtmNorthing(), item.getUtmEasting(),
            item.getRightOfWay(), item.getArchImpactAssessInd(),
            item.getSiteLocation(), item.getProjectEstablishedDate(),
            item.getRecreationViewInd(), item.getRevisionCount(),
            item.getEntryUserid(), item.getEntryTimestamp(),
            item.getUpdateUserid(), item.getUpdateTimestamp(),
            item.getArchImpactDate(), item.getBordenNo(),
            item.getCampHostInd(), item.getLowMobilityAccessInd());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationPlan() {
    var results = this.recreationPlanRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationPlan.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getRecProjectSkey(),
            item.getPlanTypeCode(), item.getRemarks());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationOccupancyCode() {
    var results = this.recreationOccupancyCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationOccupancyCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationOccupancyCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationObjective() {
    var results = this.recreationObjectiveRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationObjective.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getForestFile(),
            item.getObjectiveDescription(),
            item.getObjectiveEstablishedDate(),
            item.getObjectiveAmendedDate(),
            item.getObjectiveCancelledDate(),
            item.getRevisionCount(),
            item.getEntryUserid(),
            item.getEntryTimestamp(),
            item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationMaintainStdCode() {
    var results = this.recreationMaintainStdCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationMaintainStdCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationMaintainStdCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationInspectionReport() {
    var results = this.recreationInspectionReportRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationInspectionReport.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getForestFile(), item.getSiteName(),
            item.getLocation(), item.getInspectedBy(), item.getCampsiteNo(),
            item.getOccupiedCampsiteNo(), item.getVehicleNo(), item.getCampingPartyNo(),
            item.getDayUsePartyNo(), item.getWithPassNo(), item.getWithoutPassNo(),
            item.getAbsentOwnerNo(), item.getTotalInspectedNo(), item.getPurchasedPassNo(),
            item.getRefusedPassNo(), item.getContractId(), item.getContractor(),
            item.getRecProjectSkey(), item.getEntryTimestamp(), item.getEntryUserid(),
            item.getUpdateTimestamp(), item.getUpdateUserid());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationFileTypeCode() {
    var results = this.recreationFileTypeCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationFileTypeCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationFileTypeCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationFileStatusCode() {
    var results = this.recreationFileStatusCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationFileStatusCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationFileStatusCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationFee() {
    var results = this.recreationFeeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationFee.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getId(), item.getForestFile(), item.getFeeAmount(),
            item.getFeeStartDate(), item.getFeeEndDate(), item.getMondayInd(),
            item.getTuesdayInd(), item.getWednesdayInd(), item.getThursdayInd(),
            item.getFridayInd(), item.getSaturdayInd(), item.getSundayInd(),
            item.getRecreationFeeCode(), item.getRevisionCount(), item.getEntryUserid(),
            item.getEntryTimestamp(), item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationFeeCode() {
    var results = this.recreationFeeCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationFeeCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationFeeCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationFeatureCode() {
    var results = this.recreationFeatureCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationFeatureCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationFeatureCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationDistrictXref() {
    var results = this.recreationDistrictXrefRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationDistrictXref.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationDistrictCode(),
            item.getForestFileId(),
            item.getRevisionCount(),
            item.getEntryUserid(),
            item.getEntryTimestamp(),
            item.getUpdateUserid(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationDistrictCode() {
    var results = this.recreationDistrictCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationDistrictCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationDistrictCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationDefinedCampsite() {
    var results = this.recreationDefinedCampsiteRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationDefinedCampsite.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getCampsiteNumber(),
            item.getEstimatedRepairCost(), item.getRecreationRemedRepairCode(),
            item.getRepairCompleteDate(), item.getRevisionCount(),
            item.getEntryUserid(), item.getEntryTimestamp(),
            item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationDefCsRprHistory() {
    var results = this.recreationDefCsRprHistoryRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationDefCsRprHistory.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getForestFileId(), item.getCampsiteNumber(),
            item.getRecreationRemedRepairCode(), item.getEstimatedRepairCost(),
            item.getRepairCompleteDate(), item.getRevisionCount(),
            item.getEntryUserid(), item.getEntryTimestamp(),
            item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void extractAndUploadRecreationControlAccessCode() {
    var results = this.recreationControlAccessCodeRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationControlAccessCode.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationControlAccessCode(),
            item.getDescription(),
            item.getEffectiveDate(),
            item.getExpiryDate(),
            item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private void extractAndUploadRecreationComment() {
    var results = this.recreationCommentRepository.findAll();
    var entityMetadata = getEntityMetadata(RecreationComment.class);
    try (
        var out = new FileWriter(entityMetadata.filePath());
        var printer = new CSVPrinter(out, entityMetadata.csvFormatBuilder().build());) {
      for (var item : results) {
        printer.printRecord(item.getRecreationCommentId(), item.getForestFileId(), item.getClosureInd(),
            item.getProjectComment(), item.getCommentDate(), item.getRevisionCount(), item.getEntryUserid(),
            item.getEntryTimestamp(), item.getUpdateUserid(), item.getUpdateTimestamp());
      }
      printer.flush();
      this.s3UploaderService.uploadFileToS3(entityMetadata.filePath(), entityMetadata.fileName());
    } catch (IOException e) {
      e.printStackTrace();
    }
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
