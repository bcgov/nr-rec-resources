package ca.bc.gov.nrs.environment.fta.el.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ecs.EcsClient;
import software.amazon.awssdk.services.ecs.model.*;

/**
 * Service responsible for executing Flyway database migration tasks in AWS ECS.
 */
@Service
public class FlywayTaskRunnerService {

  private static final Logger logger = LoggerFactory.getLogger(FlywayTaskRunnerService.class);

  @Value("${cloud.aws.ecs.flyway.flywayEcsCluster}")
  private String flywayEcsCluster;

  @Value("${cloud.aws.ecs.flyway.flywayTaskDefinition}")
  private String flywayTaskDefinition;

  @Value("${cloud.aws.ecs.flyway.flywayTaskVpcSubnet}")
  private String flywayTaskVpcSubnet;

  @Value("${cloud.aws.ecs.flyway.flywayTaskVpcSecurityGroup}")
  private String flywayTaskVpcSecurityGroup;

  private final EcsClient ecsClient;

  public FlywayTaskRunnerService(EcsClient ecsClient) {
    this.ecsClient = ecsClient;
  }

  @Retryable(maxAttempts = 5, backoff = @Backoff(multiplier = 2, delay = 2000))
  public void runFlywayTask() {
    logger.info("Using Flyway ECS Cluster: {}", flywayEcsCluster);
    logger.info("Using Flyway Task Definition: {}", flywayTaskDefinition);

    RunTaskRequest request = RunTaskRequest.builder()
        .cluster(flywayEcsCluster)
        .taskDefinition(flywayTaskDefinition)
        .launchType(LaunchType.FARGATE)
        .networkConfiguration(
            NetworkConfiguration.builder()
                .awsvpcConfiguration(
                    AwsVpcConfiguration.builder()
                        .subnets(flywayTaskVpcSubnet)
                        .securityGroups(flywayTaskVpcSecurityGroup)
                        .build()
                )
                .build()
        )
        .count(1)
        .build();

    RunTaskResponse response = ecsClient.runTask(request);
    String taskArn = response.tasks().getFirst().taskArn();
    logger.info("Started Flyway ECS task: {}", taskArn);

    waitForTaskCompletion(taskArn);
  }

  private void waitForTaskCompletion(String taskArn) {
    boolean taskCompleted = false;
    int maxAttempts = 60; // (60 * 10 seconds) - 10 minutes with 10-second intervals
    int attempts = 0;

    logger.info("Starting to monitor task {} for completion", taskArn);

    while (!taskCompleted && attempts < maxAttempts) {
      attempts++;
      logger.info("Checking task status - attempt {}/{}", attempts, maxAttempts);

      DescribeTasksResponse describeTasksResponse = ecsClient.describeTasks(
          DescribeTasksRequest.builder()
              .cluster(flywayEcsCluster)
              .tasks(taskArn)
              .build()
      );

      Task task = describeTasksResponse.tasks().getFirst();
      String status = task.lastStatus();
      logger.info("Current task status: {}", status);

      if ("STOPPED".equals(status)) {
        logger.info("Task has stopped. Checking exit code and reason...");
        int exitCode = task.containers().getFirst().exitCode();
        logger.info("Task exit code: {}", exitCode);

        if (exitCode != 0) {
          logger.error("Task failed with reason: {}", task.stoppedReason());
          throw new RuntimeException("Flyway task failed: " + task.stoppedReason());
        }
        taskCompleted = true;
        logger.info("Flyway task completed successfully");
      } else {
        logger.info("Task still in progress. Waiting 10 seconds before next check...");
        try {
          Thread.sleep(10000);
        } catch (InterruptedException e) {
          logger.error("Task monitoring interrupted", e);
          Thread.currentThread().interrupt();
          throw new RuntimeException("Task monitoring was interrupted", e);
        }
      }
    }

    if (!taskCompleted) {
      logger.error("Task monitoring timed out after {} attempts ({} seconds)", maxAttempts, maxAttempts * 10);
      throw new RuntimeException("Flyway task timed out after " + maxAttempts * 10 + " seconds");
    }
  }
}
