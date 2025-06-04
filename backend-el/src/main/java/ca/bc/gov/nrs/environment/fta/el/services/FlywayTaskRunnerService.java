package ca.bc.gov.nrs.environment.fta.el.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.ecs.EcsClient;
import software.amazon.awssdk.services.ecs.model.*;

@Service
public class FlywayTaskRunnerService {

  private static final Logger logger = LoggerFactory.getLogger(FlywayTaskRunnerService.class);

  @Value("${cloud.aws.ecs.flyway.ecsCluster}")
  private String flywayEcsCluster;

  @Value("${cloud.aws.ecs.flyway.taskDefinition}")
  private String flywayTaskDefinition;

  @Value("${cloud.aws.ecs.flyway.subnet}")
  private String flywaySubnet;

  @Value("${cloud.aws.ecs.flyway.securityGroupId}")
  private String flywaySecurityGroupId;

  private final EcsClient ecsClient;

  public FlywayTaskRunnerService(EcsClient ecsClient) {
    this.ecsClient = ecsClient;
  }

  public void runFlywayTask() {
    RunTaskRequest request = RunTaskRequest.builder()
        .cluster(flywayEcsCluster)
        .taskDefinition(flywayTaskDefinition)
        .launchType(LaunchType.FARGATE)
        .networkConfiguration(
            NetworkConfiguration.builder()
                .awsvpcConfiguration(
                    AwsVpcConfiguration.builder()
                        .subnets(flywaySubnet)
                        .securityGroups(flywaySecurityGroupId)
                        .build()
                ).build()
        )
        .count(1)
        .build();

    RunTaskResponse response = ecsClient.runTask(request);
    logger.info("Started ECS task: {}", response.tasks());
  }
}
