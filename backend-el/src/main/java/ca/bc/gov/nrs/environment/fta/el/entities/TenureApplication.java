package ca.bc.gov.nrs.environment.fta.el.entities;

import org.springframework.data.annotation.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TENURE_APPLICATION", schema = "THE")
@Immutable
public class TenureApplication {

  @Id
  @Column(name = "TENURE_APP_ID", nullable = false)
  private Long tenureAppId;

  @Column(name = "TENURE_APPLICATION_TYPE_CODE", nullable = false, length = 3)
  private String tenureApplicationTypeCode;

  @Column(name = "TENURE_APPNAME", nullable = false, length = 250)
  private String tenureAppname;

  @Column(name = "SUBMISSION_ID", nullable = false)
  private Long submissionId;

  @Column(name = "FOREST_FILE_ID", length = 10)
  private String forestFileId;

  @Column(name = "CLIENT_NUMBER", nullable = false, length = 8)
  private String clientNumber;

  @Column(name = "CLIENT_LOCN_CODE", nullable = false, length = 2)
  private String clientLocnCode;

  @Column(name = "CASCADE_SPLIT_CODE", length = 1)
  private String cascadeSplitCode;

  @Column(name = "TENURE_APPLICATION_STATE_CODE", nullable = false, length = 3)
  private String tenureApplicationStateCode;

  @Column(name = "TENURE_APP_PURP_CODE", nullable = false, length = 3)
  private String tenureAppPurpCode;

  @Column(name = "ADJUDICATION_IND", nullable = false, length = 1)
  private String adjudicationInd;

  @Column(name = "ADJUDICATED_BY", length = 30)
  private String adjudicatedBy;

  @Column(name = "ADJUDICATION_DATE")
  private LocalDateTime adjudicationDate;

  @Column(name = "ADJUDICATION_REQUESTED_IND", nullable = false, length = 1)
  private String adjudicationRequestedInd;

  @Column(name = "CURRENT_ASSIGNED_TO", nullable = false, length = 4)
  private String currentAssignedTo;

  @Column(name = "IMAGE_CREATED_IND", nullable = false, length = 1)
  private String imageCreatedInd;

  @Column(name = "MAP_REPORT_CREATED_IND", nullable = false, length = 1)
  private String mapReportCreatedInd;

  @Column(name = "DESCRIPTION", length = 255)
  private String description;

  @Column(name = "MIN_X", nullable = false)
  private Integer minX;

  @Column(name = "MIN_Y", nullable = false)
  private Integer minY;

  @Column(name = "MAX_X", nullable = false)
  private Integer maxX;

  @Column(name = "MAX_Y", nullable = false)
  private Integer maxY;

  @Column(name = "MANAGEMENT_UNIT_NUMBER", length = 10)
  private String managementUnitNumber;

  @Column(name = "MANAGEMENT_UNIT_BLOCK", length = 4)
  private String managementUnitBlock;

  @Column(name = "MANAGEMENT_UNIT_SUB_BLOCK", length = 3)
  private String managementUnitSubBlock;

  @Column(name = "COMPLETION_DATE")
  private LocalDateTime completionDate;

  @Column(name = "FINALIZED_BY", length = 30)
  private String finalizedBy;

  @Column(name = "SUBMISSION_DATE", nullable = false)
  private LocalDateTime submissionDate;

  @Column(name = "IMAGE_ERROR", nullable = false)
  private Integer imageError;

  @Column(name = "MAP_REPORT_ERROR", nullable = false)
  private Integer mapReportError;

  @Column(name = "SPATIAL_DATA_ERROR", nullable = false)
  private Integer spatialDataError;

  @Column(name = "SPATIAL_IND", nullable = false, length = 1)
  private String spatialInd;

  @Column(name = "FILE_CREATED_IND", nullable = false, length = 1)
  private String fileCreatedInd;

  @Column(name = "IMAGE_HEIGHT")
  private Integer imageHeight;

  @Column(name = "IMAGE_WIDTH")
  private Integer imageWidth;

  @Column(name = "METERS_PER_PIXEL", precision = 10, scale = 3)
  private BigDecimal metersPerPixel;

  @Column(name = "IMAGE_SCALE")
  private Integer imageScale;

  @Column(name = "ADJUDICATION_COMMENT", length = 2000)
  private String adjudicationComment;

  @Column(name = "CUTTING_PERMIT_ID", length = 3)
  private String cuttingPermitId;

  @Column(name = "IMAGE_MAP_SIZE_CODE", length = 1)
  private String imageMapSizeCode;

  @Column(name = "ORG_UNIT_NO", nullable = false)
  private Long orgUnitNo;

  @Column(name = "GEO_ORG_UNIT_NO")
  private Long geoOrgUnitNo;

  @Column(name = "IMAGE_MIME_TYPE_CODE", length = 3)
  private String imageMimeTypeCode;

  @Column(name = "IMAGE_ORIENTATION_CODE", length = 1)
  private String imageOrientationCode;

  @Column(name = "IMAGE_CREATE_IN_PROGRESS_IND", nullable = false, length = 1)
  private String imageCreateInProgressInd;

  @Column(name = "IMAGE_CREATE_REQUESTED_BY", length = 30)
  private String imageCreateRequestedBy;

  @Column(name = "IMAGE_CREATE_REQUESTED_DATE")
  private LocalDateTime imageCreateRequestedDate;

  @Column(name = "OVERLAY_GEO_DISTRICT_CODE", length = 6)
  private String overlayGeoDistrictCode;

  @Column(name = "BCGS_MAPSHEET_NO", length = 32)
  private String bcgsMapsheetNo;

  @Column(name = "TSA_NUMBER", length = 2)
  private String tsaNumber;

  @Column(name = "LAND_DISTRICT", length = 50)
  private String landDistrict;

  @Column(name = "PULPWOOD_AGREEMENT", length = 20)
  private String pulpwoodAgreement;

  @Column(name = "UTM_ZONE")
  private Integer utmZone;

  @Column(name = "REVISION_COUNT", nullable = false)
  private Integer revisionCount;

  @Column(name = "ENTRY_USERID", nullable = false, length = 30)
  private String entryUserid;

  @Column(name = "ENTRY_TIMESTAMP", nullable = false)
  private LocalDateTime entryTimestamp;

  @Column(name = "UPDATE_USERID", nullable = false, length = 30)
  private String updateUserid;

  @Column(name = "UPDATE_TIMESTAMP", nullable = false)
  private LocalDateTime updateTimestamp;

  @Column(name = "TENURE_APP_GUID", nullable = false)
  private byte[] tenureAppGuid;

  @Column(name = "APPLICATION_DECISION_MESSAGE", length = 1000)
  private String applicationDecisionMessage;

  @Column(name = "CLEARANCE_STATUS_REQUEST_URI", length = 2000)
  private String clearanceStatusRequestUri;

  @Column(name = "DEPENDENT_SUBMISSION_REFERENCE", length = 100)
  private String dependentSubmissionReference;

  @Column(name = "TENURE_AMENDMENT_ID")
  private Long tenureAmendmentId;

  @Column(name = "BUSINESS_AMENDMENT_ID")
  private Long businessAmendmentId;

  public Long getTenureAppId() {
    return tenureAppId;
  }

  public void setTenureAppId(Long tenureAppId) {
    this.tenureAppId = tenureAppId;
  }

  public String getTenureApplicationTypeCode() {
    return tenureApplicationTypeCode;
  }

  public void setTenureApplicationTypeCode(String tenureApplicationTypeCode) {
    this.tenureApplicationTypeCode = tenureApplicationTypeCode;
  }
}

