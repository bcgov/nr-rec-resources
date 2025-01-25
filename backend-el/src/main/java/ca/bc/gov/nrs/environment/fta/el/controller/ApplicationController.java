package ca.bc.gov.nrs.environment.fta.el.controller;

import ca.bc.gov.nrs.environment.fta.el.AWSConfig;
import ca.bc.gov.nrs.environment.fta.el.entities.RecreationAccess;
import ca.bc.gov.nrs.environment.fta.el.services.ApplicationService;
import jakarta.persistence.Column;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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
