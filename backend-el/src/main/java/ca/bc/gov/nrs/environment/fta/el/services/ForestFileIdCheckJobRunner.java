package ca.bc.gov.nrs.environment.fta.el.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Runs an ad-hoc forest file ID existence check against THE.RECREATION_PROJECT
 * when JOB_MODE is explicitly set to "check-ids".
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(name = "job.mode", havingValue = "check-ids")
public class ForestFileIdCheckJobRunner implements CommandLineRunner {

  private final Logger logger = LoggerFactory.getLogger(ForestFileIdCheckJobRunner.class);
  private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

  @Value("${job.forest-file-ids-to-check:REC277563,REC32883}")
  private String forestFileIdsToCheck;

  public ForestFileIdCheckJobRunner(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
    this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
  }

  @Override
  public void run(String... args) {
    logger.info("Running recreation project forest-file ID existence check");

    Set<String> requestedIds = new LinkedHashSet<>();
    for (var rawId : forestFileIdsToCheck.split(",")) {
      var normalized = rawId == null ? "" : rawId.trim().toUpperCase();
      if (!normalized.isEmpty()) {
        requestedIds.add(normalized);
      }
    }

    if (requestedIds.isEmpty()) {
      logger.warn("No valid forest file IDs found after parsing input: {}", forestFileIdsToCheck);
      return;
    }

    var sql = """
      select trim(upper(forest_file_id))
      from THE.RECREATION_PROJECT
      where trim(upper(forest_file_id)) in (:ids)
      """;

    var foundIds = new LinkedHashSet<>(this.namedParameterJdbcTemplate.query(
      sql,
      new MapSqlParameterSource("ids", requestedIds),
      (rs, rowNum) -> rs.getString(1)
    ));

    for (var id : requestedIds) {
      var status = foundIds.contains(id) ? "FOUND" : "MISSING";
      logger.info("THE.RECREATION_PROJECT check | FOREST_FILE_ID={} | STATUS={}", id, status);
    }
  }
}

