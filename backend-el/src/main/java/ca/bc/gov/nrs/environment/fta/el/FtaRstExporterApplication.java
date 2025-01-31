package ca.bc.gov.nrs.environment.fta.el;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;

@SpringBootApplication
@EnableRetry
public class FtaRstExporterApplication implements CommandLineRunner {

  private final ApplicationService applicationService;

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
