package ca.bc.gov.nrs.environment.fta.el;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class FtaRstExporterApplication implements CommandLineRunner {

  private final ApplicationService applicationService;
  private static final Logger logger = LoggerFactory
    .getLogger(FtaRstExporterApplication.class);

  public FtaRstExporterApplication(ApplicationService applicationService) {
    this.applicationService = applicationService;
  }

  public static void main(String[] args) {
    SpringApplication.run(FtaRstExporterApplication.class, args);
  }

  @Override
  public void run(String... args) {
    this.applicationService.extractAndUploadCSVToS3();
  }

}
