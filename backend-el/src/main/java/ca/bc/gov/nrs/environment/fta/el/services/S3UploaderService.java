package ca.bc.gov.nrs.environment.fta.el.services;

import java.io.File;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3UploaderService {
  private final Logger logger = LoggerFactory.getLogger(this.getClass());
  private final S3Client s3Client;
  @Value("${ca.bc.gov.nrs.environment.fta.el.s3.bucket}")
  private String bucket;
  @Value("${ca.bc.gov.nrs.environment.fta.el.s3.bucket.attachment.threshold}")
  private Integer attachmentTheshold;
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

  @Retryable(maxAttempts = 5, backoff = @Backoff(multiplier = 2, delay = 2000))
  public void uploadBytesToS3(String filePath, String fileName, byte[] fileContent) {
    try {
      var putObjectRequest = PutObjectRequest.builder()
          .bucket(bucket)
          .key(filePath + "/" + fileName)
          .build();
      this.s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(fileContent));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * This method will check for a specific file to exist in s3 or not given the
   * file path and file name.
   * Bucket is read from application.properties file.
   *
   * @param filePath the folder path in s3
   * @param fileName the name of the file to look for
   */
  @Retryable(maxAttempts = 5, backoff = @Backoff(multiplier = 2, delay = 2000))
  public boolean checkIfFileExistInTheBucketPath(String filePath, String fileName) {
    try {
      var keyToCheck = filePath + "/" + fileName;
      var listObjectsRequest = software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
          .bucket(bucket)
          .prefix(filePath)
          .build();
      var listObjectsResponse = this.s3Client.listObjectsV2(listObjectsRequest);
      for (var listObject : listObjectsResponse.contents()) {
        logger.debug("Key from s3 {}",listObject.key());
        logger.debug("Key to check {}", keyToCheck);
        if (keyToCheck.equals(listObject.key())) {
          return true;
        }
      }
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    return false;
  }

  /**
   * This method will check for the count, if the number of objects in the bucket are more than x(a value from property file),
   * then it is considered that the attachment process is completed earlier and getting only one week back of data would be sufficient.
   * @return true or false based on whether initial load has been done.
   */
  public boolean isAttachmentProcessCompletedEarlier() {
    var countObjectsRequest= software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
        .bucket(bucket)
        .prefix("uploads/attachments")
        .maxKeys(attachmentTheshold)
        .build();
    var countObjectsResponse = this.s3Client.listObjectsV2Paginator(countObjectsRequest);
    long totalObjects = 0;

    for (ListObjectsV2Response page : countObjectsResponse) {
        long retrievedPageSize = page.contents().stream()
          .reduce(0, (subtotal, element) -> subtotal + 1, Integer::sum);
        totalObjects += retrievedPageSize;
    }
    logger.info("Total objects in the bucket: {}, attachment threshold {}", totalObjects, attachmentTheshold);
    return totalObjects > attachmentTheshold;
  }
}
