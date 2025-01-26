package ca.bc.gov.nrs.environment.fta.el.services;

import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3UploaderService {
  private final S3Client s3Client;
  @Value("${ca.bc.gov.nrs.environment.fta.el.s3.bucket}")
  private String bucket;

  public S3UploaderService(S3Client s3Client) {
    this.s3Client = s3Client;
  }

  @Retryable(maxAttempts = 5, backoff = @Backoff(multiplier = 2, delay = 2000))
  public void uploadFileToS3(String filePath, String fileName) {
    try {

      var file = new File(filePath);
      var putObjectRequest = PutObjectRequest.builder()
          .bucket(bucket)
          .key("uploads/" + fileName)
          .build();
      this.s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromFile(file));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
