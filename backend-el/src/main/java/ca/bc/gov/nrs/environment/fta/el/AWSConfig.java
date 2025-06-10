package ca.bc.gov.nrs.environment.fta.el;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ecs.EcsClient;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AWSConfig {

  // Injecting access key from application.properties
  @Value("${cloud.aws.credentials.accessKey}")
  private String accessKey;

  // Injecting secret key from application.properties
  @Value("${cloud.aws.credentials.secretKey}")
  private String accessSecret;

  // Injecting region from application.properties
  @Value("${cloud.aws.region.static}")
  private String region;

  // Creating a bean for Amazon S3 client
  @Bean
  public S3Client s3Client() {
    AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, accessSecret);
    return S3Client.builder()
        .region(Region.of(region))
        .credentialsProvider(() -> awsCreds)
        .build();
  }

  // Creating a bean for AWS ECS client
  @Bean
  public EcsClient ecsClient() {
    AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, accessSecret);
    return EcsClient.builder()
        .region(Region.of(region))
        .credentialsProvider(() -> awsCreds)
        .build();
  }
}
