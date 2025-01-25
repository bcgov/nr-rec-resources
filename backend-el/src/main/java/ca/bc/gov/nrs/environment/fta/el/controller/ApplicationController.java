package ca.bc.gov.nrs.environment.fta.el.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;

@RestController
@RequestMapping("/api")
public class ApplicationController {


  private final ApplicationService applicationService;


  public ApplicationController(ApplicationService applicationService) {
    this.applicationService = applicationService;
  }

  @GetMapping
  public void runCSVGenerationAndUpload() {
    this.applicationService.extractAndUploadCSVToS3();
  }

}
