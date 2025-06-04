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

  public void runFlywayTask() {
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
                ).build()
        )
        .count(1)
        .build();

    RunTaskResponse response = ecsClient.runTask(request);
    logger.info("Started Flyway ECS task: {}", response.tasks());
  }
}
