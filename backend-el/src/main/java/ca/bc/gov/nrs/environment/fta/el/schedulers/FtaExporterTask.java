package ca.bc.gov.nrs.environment.fta.el.schedulers;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;

@Component
public class FtaExporterTask {
  private final ApplicationService applicationService;

  public FtaExporterTask(ApplicationService applicationService) {
    this.applicationService = applicationService;
  }

  @Scheduled(cron = "0 49 * * * *")
  public void runExportToS3() {
    try {
      this.applicationService.extractAndUploadCSVToS3();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
