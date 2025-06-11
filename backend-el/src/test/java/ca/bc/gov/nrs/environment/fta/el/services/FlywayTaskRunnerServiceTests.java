package ca.bc.gov.nrs.environment.fta.el.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.stubbing.Answer;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.ecs.EcsClient;
import software.amazon.awssdk.services.ecs.model.*;
import java.util.HashSet;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class FlywayTaskRunnerServiceTests {

  @Mock
  private EcsClient ecsClient;

  @InjectMocks
  private FlywayTaskRunnerService service;

  @BeforeEach
  void setUp() {
    // Set a valid config: cluster,taskDef,subnet,sg
    ReflectionTestUtils.setField(service, "flywayTaskConfigs", "test-cluster::test-task-def::subnet-1::sg-1| test-cluster-2::test-task-def-2::subnet-2::sg-2");
  }

  @Test
  void runFlywayTask_successfulTask() {
    // Mock ECS runTask response to use the taskArn from the request
    Answer<RunTaskResponse> runTaskAnswer = invocation -> {
      RunTaskRequest req = invocation.getArgument(0);
      String cluster = req.cluster();
      String taskDef = req.taskDefinition();
      String taskArn = String.format("arn:aws:ecs:region:123456789012:task/%s-%s", cluster, taskDef);
      Task mockTask = Task.builder()
              .taskArn(taskArn)
              .lastStatus("PENDING")
              .containers(Container.builder().exitCode(0).build())
              .build();
      return RunTaskResponse.builder().tasks(mockTask).build();
    };

    when(ecsClient.runTask(any(RunTaskRequest.class))).thenAnswer(runTaskAnswer);

    // Mock ECS describeTasks response (simulate running then stopped)
    Answer<DescribeTasksResponse> describeTasksAnswer = invocation -> {
      DescribeTasksRequest req = invocation.getArgument(0);
      String taskArn = req.tasks().getFirst();

      // First three calls returns RUNNING, second call returns STOPPED
      if (Mockito.mockingDetails(ecsClient).getInvocations().stream()
              .filter(i -> i.getMethod().getName().equals("describeTasks")).count() < 3) {
        Task runningTask = Task.builder()
                .taskArn(taskArn)
                .lastStatus("RUNNING")
                .containers(Container.builder().exitCode(0).build())
                .build();
        return DescribeTasksResponse.builder().tasks(runningTask).build();
      } else {
        Task stoppedTask = Task.builder()
                .taskArn(taskArn)
                .lastStatus("STOPPED")
                .containers(Container.builder().exitCode(0).build())
                .build();
        return DescribeTasksResponse.builder().tasks(stoppedTask).build();
      }
    };

    when(ecsClient.describeTasks(any(DescribeTasksRequest.class))).thenAnswer(describeTasksAnswer);

    assertDoesNotThrow(() -> service.runFlywayTasks());
    verify(ecsClient, atLeastOnce()).describeTasks(any(DescribeTasksRequest.class));

    // Additional verification for cluster and task definition for all invocations (order is not guaranteed in parallel)
    ArgumentCaptor<RunTaskRequest> runTaskRequestCaptor = ArgumentCaptor.forClass(RunTaskRequest.class);
    verify(ecsClient, times(2)).runTask(runTaskRequestCaptor.capture());
    var requests = runTaskRequestCaptor.getAllValues();

    // Collect all cluster/taskDef pairs for assertion, order-independent
    Set<String> actualPairs = new HashSet<>();
    for (RunTaskRequest req : requests) {
      actualPairs.add(req.cluster() + "::" + req.taskDefinition());
    }
    Set<String> expectedPairs = Set.of(
            "test-cluster::test-task-def",
            "test-cluster-2::test-task-def-2"
    );
    assertEquals(expectedPairs, actualPairs);
  }

  @Test
  void runFlywayTask_taskFailsWithExitCode() {
    Task mockTask = Task.builder()
            .taskArn("arn:aws:ecs:region:123456789012:task/test-task")
            .lastStatus("PENDING")
            .containers(Container.builder().exitCode(1).build())
            .stoppedReason("Exit 1")
            .build();

    RunTaskResponse runTaskResponse = RunTaskResponse.builder()
            .tasks(mockTask)
            .build();

    Task stoppedTask = mockTask.toBuilder().lastStatus("STOPPED").containers(Container.builder().exitCode(1).build()).stoppedReason("Exit 1").build();
    DescribeTasksResponse stoppedResponse = DescribeTasksResponse.builder().tasks(stoppedTask).build();

    when(ecsClient.runTask(any(RunTaskRequest.class))).thenReturn(runTaskResponse);
    when(ecsClient.describeTasks(any(DescribeTasksRequest.class)))
            .thenReturn(stoppedResponse);

    // Check the cause chain for the expected message, since parallel execution wraps exceptions
    Throwable cause = assertThrows(RuntimeException.class, () -> service.runFlywayTasks());
    boolean found = false;
    while (cause != null) {
      if (cause.getMessage() != null && cause.getMessage().contains("Flyway task failed")) {
        found = true;
        break;
      }
      cause = cause.getCause();
    }
    assertTrue(found, "Exception message should contain 'Flyway task failed'");
  }

  @Test
  void runFlywayTask_invalidConfig_skips() {
    ReflectionTestUtils.setField(service, "flywayTaskConfigs", "invalid-config");
    service.runFlywayTasks();
    verify(ecsClient, never()).runTask(any(RunTaskRequest.class));
  }

  @Test
  void testSingleConfig_successfulTask() {
    ReflectionTestUtils.setField(service, "flywayTaskConfigs", "test-cluster::test-task-def::subnet-1::sg-1");

    Answer<RunTaskResponse> runTaskAnswer = invocation -> {
      RunTaskRequest req = invocation.getArgument(0);
      String cluster = req.cluster();
      String taskDef = req.taskDefinition();
      String taskArn = String.format("arn:aws:ecs:region:123456789012:task/%s-%s", cluster, taskDef);
      Task mockTask = Task.builder()
              .taskArn(taskArn)
              .lastStatus("PENDING")
              .containers(Container.builder().exitCode(0).build())
              .build();
      return RunTaskResponse.builder().tasks(mockTask).build();
    };

    when(ecsClient.runTask(any(RunTaskRequest.class))).thenAnswer(runTaskAnswer);

    Answer<DescribeTasksResponse> describeTasksAnswer = invocation -> {
      DescribeTasksRequest req = invocation.getArgument(0);
      String taskArn = req.tasks().getFirst();
      Task stoppedTask = Task.builder()
              .taskArn(taskArn)
              .lastStatus("STOPPED")
              .containers(Container.builder().exitCode(0).build())
              .build();
      return DescribeTasksResponse.builder().tasks(stoppedTask).build();
    };

    when(ecsClient.describeTasks(any(DescribeTasksRequest.class))).thenAnswer(describeTasksAnswer);

    assertDoesNotThrow(() -> service.runFlywayTasks());
    verify(ecsClient, atLeastOnce()).describeTasks(any(DescribeTasksRequest.class));

    ArgumentCaptor<RunTaskRequest> runTaskRequestCaptor = ArgumentCaptor.forClass(RunTaskRequest.class);
    verify(ecsClient, times(1)).runTask(runTaskRequestCaptor.capture());
    RunTaskRequest req = runTaskRequestCaptor.getValue();
    assertEquals("test-cluster", req.cluster());
    assertEquals("test-task-def", req.taskDefinition());
  }
}
