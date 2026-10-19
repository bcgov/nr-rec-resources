package ca.bc.gov.nrs.environment.fta.el;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;
import ca.bc.gov.nrs.environment.fta.el.services.SchemaProbeService;

@SpringBootApplication
@EnableRetry
public class FtaRstExporterApplication implements CommandLineRunner {

  private static final Logger logger = LoggerFactory.getLogger(FtaRstExporterApplication.class);

  private static final String JOB_MODE_HOURLY = "hourly";
  private static final String JOB_MODE_DAILY = "daily";
  private static final String JOB_MODE_NOTES = "notes";
  /** TEMPORARY, paired with SchemaProbeService. */
  private static final String JOB_MODE_PROBE = "probe";

  private final ApplicationService applicationService;
  private final SchemaProbeService schemaProbeService;

  @Value("${job.mode}")
  private String jobMode;

  public FtaRstExporterApplication(
      ApplicationService applicationService,
      SchemaProbeService schemaProbeService) {
    this.applicationService = applicationService;
    this.schemaProbeService = schemaProbeService;
  }

  public static void main(String[] args) {
    SpringApplication.run(FtaRstExporterApplication.class, args);
  }

  @Override
  public void run(String... args) {
    if (jobMode.equals(JOB_MODE_HOURLY)) {
      logger.info("Running hourly CSV extraction and upload");
      this.applicationService.extractAndUploadCSVToS3Hourly();
    } else if (jobMode.equals(JOB_MODE_PROBE)) {
      logger.info("Running schema probe");
      this.schemaProbeService.run();
    } else if (jobMode.equals(JOB_MODE_NOTES)) {
      logger.info("Running notes-only CSV extraction and upload");
      this.applicationService.extractAndUploadNotes();
    } else if (jobMode.equals(JOB_MODE_DAILY)) {
      logger.info("Running daily CSV extraction and upload");
      this.applicationService.extractAndUploadCSVToS3();
    } else {
        logger.info("Invalid job mode specified: {}. Expected {}, {}, {} or {}. Exiting...", jobMode, JOB_MODE_HOURLY, JOB_MODE_DAILY, JOB_MODE_NOTES, JOB_MODE_PROBE);
    }
  }
}
