package ca.bc.gov.nrs.environment.fta.el;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;
import ca.bc.gov.nrs.environment.fta.el.services.TenureExportService;

@SpringBootApplication
@EnableRetry
public class FtaRstExporterApplication implements CommandLineRunner {

  private static final Logger logger = LoggerFactory.getLogger(FtaRstExporterApplication.class);

  private static final String JOB_MODE_HOURLY = "hourly";
  private static final String JOB_MODE_DAILY = "daily";
  private static final String JOB_MODE_TENURE = "tenure";

  private final ApplicationService applicationService;
  private final TenureExportService tenureExportService;

  @Value("${job.mode}")
  private String jobMode;

  public FtaRstExporterApplication(ApplicationService applicationService, TenureExportService tenureExportService) {
    this.applicationService = applicationService;
    this.tenureExportService = tenureExportService;
  }

  public static void main(String[] args) {
    SpringApplication.run(FtaRstExporterApplication.class, args);
  }

  @Override
  public void run(String... args) {
    if (jobMode.equals(JOB_MODE_HOURLY)) {
      logger.info("Running hourly CSV extraction and upload");
      this.applicationService.extractAndUploadCSVToS3Hourly();
    } else if (jobMode.equals(JOB_MODE_DAILY)) {
      logger.info("Running daily CSV extraction and upload");
      this.applicationService.extractAndUploadCSVToS3();
      logger.info("Running tenure extraction and upload as part of daily job");
      this.tenureExportService.extractAndUploadTenureDataToS3();
    } else if (jobMode.equals(JOB_MODE_TENURE)) {
      logger.info("Running tenure extraction and upload");
      this.tenureExportService.extractAndUploadTenureDataToS3();
    } else {
        logger.info("Invalid job mode specified: {}. Expected {}, {} or {}. Exiting...", jobMode, JOB_MODE_HOURLY, JOB_MODE_DAILY, JOB_MODE_TENURE);
    }
  }
}
