package ca.bc.gov.nrs.environment.fta.el;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class FtaRstExporterApplicationRunModeTests {

  @Mock
  private ApplicationService applicationService;

  @Test
  void run_executesHourlyWorkflow_whenJobModeIsHourly() {
    var app = new FtaRstExporterApplication(applicationService);
    ReflectionTestUtils.setField(app, "jobMode", "hourly");

    app.run();

    verify(applicationService, times(1)).extractAndUploadCSVToS3Hourly();
    verify(applicationService, never()).extractAndUploadCSVToS3();
    verify(applicationService, never()).extractAndUploadTenureDataToS3();
  }

  @Test
  void run_executesDailyWorkflow_whenJobModeIsDaily() {
    var app = new FtaRstExporterApplication(applicationService);
    ReflectionTestUtils.setField(app, "jobMode", "daily");

    app.run();

    verify(applicationService, times(1)).extractAndUploadCSVToS3();
    verify(applicationService, never()).extractAndUploadCSVToS3Hourly();
    verify(applicationService, never()).extractAndUploadTenureDataToS3();
  }

  @Test
  void run_executesTenureWorkflow_whenJobModeIsTenure() {
    var app = new FtaRstExporterApplication(applicationService);
    ReflectionTestUtils.setField(app, "jobMode", "tenure");

    app.run();

    verify(applicationService, times(1)).extractAndUploadTenureDataToS3();
    verify(applicationService, never()).extractAndUploadCSVToS3();
    verify(applicationService, never()).extractAndUploadCSVToS3Hourly();
  }

  @Test
  void run_skipsWorkflows_whenJobModeIsUnknown() {
    var app = new FtaRstExporterApplication(applicationService);
    ReflectionTestUtils.setField(app, "jobMode", "unknown");

    app.run();

    verify(applicationService, never()).extractAndUploadCSVToS3Hourly();
    verify(applicationService, never()).extractAndUploadCSVToS3();
    verify(applicationService, never()).extractAndUploadTenureDataToS3();
  }
}
