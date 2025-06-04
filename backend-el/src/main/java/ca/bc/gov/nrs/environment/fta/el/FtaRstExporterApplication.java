package ca.bc.gov.nrs.environment.fta.el;

import ca.bc.gov.nrs.environment.fta.el.services.EcsTaskService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class FtaRstExporterApplication implements CommandLineRunner {

  private final EcsTaskService ecsTaskService;

  public FtaRstExporterApplication(EcsTaskService ecsTaskService) {
    this.ecsTaskService = ecsTaskService;
  }

  public static void main(String[] args) {
    SpringApplication.run(FtaRstExporterApplication.class, args);
  }

  @Override
  public void run(String... args) {
    this.ecsTaskService.runFlywayTask();
  }
}
