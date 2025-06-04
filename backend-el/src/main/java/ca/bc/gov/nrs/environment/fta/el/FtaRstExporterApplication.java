package ca.bc.gov.nrs.environment.fta.el;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;

@SpringBootApplication
@EnableRetry
public class FtaRstExporterApplication implements CommandLineRunner {

  private static final Logger logger = LoggerFactory.getLogger(FtaRstExporterApplication.class);
  
  private final ApplicationService applicationService;

  @Value("${app.args}")
  private String appArgs;

  public FtaRstExporterApplication(ApplicationService applicationService) {
    this.applicationService = applicationService;
  }

  public static void main(String[] args) {
    SpringApplication.run(FtaRstExporterApplication.class, args);
  }

  @Override
  public void run(String... args) {
    if (appArgs.equals("--hourly-sync")) {
      logger.info("Running hourly CSV extraction and upload");
      this.applicationService.extractAndUploadCSVToS3Hourly();
    } else {
      logger.info("Running daily CSV extraction and upload");
      this.applicationService.extractAndUploadCSVToS3();
    }
  }
}
