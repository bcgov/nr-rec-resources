package ca.bc.gov.nrs.environment.fta.el.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ecs.EcsClient;
import software.amazon.awssdk.services.ecs.model.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service responsible for executing Flyway database migration tasks in AWS ECS.
 */
@Service
public class FlywayTaskRunnerService {

  private static final Logger logger = LoggerFactory.getLogger(FlywayTaskRunnerService.class);

  @Value("${cloud.aws.ecs.flyway.taskConfigs}")
  private String flywayTaskConfigs;

  private final EcsClient ecsClient;

  public FlywayTaskRunnerService(EcsClient ecsClient) {
    this.ecsClient = ecsClient;
  }

  public void runFlywayTasks() {
    String[] configs = flywayTaskConfigs.split("\\|");

    // Run each config in parallel
    List<CompletableFuture<Void>> futures = new ArrayList<>();
    for (String config : configs) {
      futures.add(CompletableFuture.runAsync(() -> runSingleFlywayTask(config.trim())));
    }
    // Wait for all to complete and propagate exceptions
    futures.forEach(f -> {
      try {
        f.join();
      } catch (Exception e) {
        throw new RuntimeException("One or more Flyway tasks failed", e);
      }
    });
  }

  private void runSingleFlywayTask(String config) {
    try {
      String[] parts = config.split("::");
      if (parts.length != 4) {
        logger.error("Invalid Flyway task config: {}", config);
        return;
      }
      String ecsCluster = parts[0].trim();
      String taskDefinition = parts[1].trim();
      String vpcSubnet = parts[2].trim();
      String vpcSecurityGroup = parts[3].trim();

      logger.info("Running Flyway ECS Task with config: cluster={}, taskDef={}, subnet={}, sg={}",
          ecsCluster, taskDefinition, vpcSubnet, vpcSecurityGroup);

      RunTaskRequest request = RunTaskRequest.builder()
          .cluster(ecsCluster)
          .taskDefinition(taskDefinition)
          .launchType(LaunchType.FARGATE)
          .networkConfiguration(
              NetworkConfiguration.builder()
                  .awsvpcConfiguration(
                      AwsVpcConfiguration.builder()
                          .subnets(vpcSubnet)
                          .securityGroups(vpcSecurityGroup)
                          .build()
                  )
                  .build()
          )
          .count(1)
          .build();

      RunTaskResponse response = ecsClient.runTask(request);
      String taskArn = response.tasks().getFirst().taskArn();
      logger.info("Started Flyway ECS task: {}", taskArn);

      waitForTaskCompletion(ecsCluster, taskArn);
    } catch (Exception ex) {
      logger.error("Exception while running Flyway ECS task for config '{}': {}", config, ex.getMessage(), ex);
      throw ex;
    }
  }

  private void waitForTaskCompletion(String ecsCluster, String taskArn) {
    boolean taskCompleted = false;
    int maxAttempts = 60;
    int attempts = 0;

    logger.info("Starting to monitor task {} for completion", taskArn);

    while (!taskCompleted && attempts < maxAttempts) {
      attempts++;
      logger.info("Checking task status for {} - attempt {}/{}", taskArn, attempts, maxAttempts);

      DescribeTasksResponse describeTasksResponse = ecsClient.describeTasks(
          DescribeTasksRequest.builder()
              .cluster(ecsCluster)
              .tasks(taskArn)
              .build()
      );

      Task task = describeTasksResponse.tasks().getFirst();
      String status = task.lastStatus();
      logger.info("Current task status for {}: {}", taskArn, status);

      if ("STOPPED".equals(status)) {
        logger.info("Task {} has stopped. Checking exit code and reason...", taskArn);
        int exitCode = task.containers().getFirst().exitCode();
        logger.info("Task {} exit code: {}", taskArn, exitCode);

        if (exitCode != 0) {
          logger.error("Task {} failed with reason: {}", taskArn, task.stoppedReason());
          throw new RuntimeException("Flyway task failed: " + task.stoppedReason());
        }
        taskCompleted = true;
        logger.info("Flyway task {} completed successfully", taskArn);
      } else {
        try {
          Thread.sleep(10000);
        } catch (InterruptedException e) {
          logger.error("Task monitoring interrupted for {}", taskArn, e);
          Thread.currentThread().interrupt();
          throw new RuntimeException("Task monitoring was interrupted", e);
        }
      }
    }

    if (!taskCompleted) {
      logger.error("Task monitoring timed out for {} after {} attempts ({} seconds)", taskArn, maxAttempts, maxAttempts * 10);
      throw new RuntimeException("Flyway task timed out after " + maxAttempts * 10 + " seconds");
    }
  }
}
