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

import java.util.ArrayList;
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

  @Value("${job.forest-file-ids-to-check:REC16070,REC16110,REC277563,REC32883,REC7616}")
  private String forestFileIdsToCheck;

  public ForestFileIdCheckJobRunner(NamedParameterJdbcTemplate namedParameterJdbcTemplate) {
    this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
  }

  @Override
  public void run(String... args) {
    logger.info("Running recreation project forest-file ID existence check");
    logger.info("Input forest file IDs (job.forest-file-ids-to-check): {}", forestFileIdsToCheck);

    Set<String> requestedIds = new LinkedHashSet<>();
    for (var rawId : forestFileIdsToCheck.split(",")) {
      var normalized = rawId == null ? "" : rawId
        .replace("'", "")
        .replace("(", "")
        .replace(")", "")
        .trim()
        .toUpperCase();
      if (!normalized.isEmpty()) {
        requestedIds.add(normalized);
      }
    }

    if (requestedIds.isEmpty()) {
      logger.warn("No valid forest file IDs found after parsing input: {}", forestFileIdsToCheck);
      return;
    }

    logger.info("Parsed {} unique forest file IDs to check: {}", requestedIds.size(), requestedIds);

    var sql = """
      select trim(upper(forest_file_id))
      from THE.RECREATION_PROJECT
      where trim(upper(forest_file_id)) in (:ids)
      """;

    logger.info("Querying THE.RECREATION_PROJECT for {} IDs", requestedIds.size());

    var foundIds = new LinkedHashSet<>(this.namedParameterJdbcTemplate.query(
      sql,
      new MapSqlParameterSource("ids", requestedIds),
      (rs, rowNum) -> rs.getString(1)
    ));

    logger.info("THE.RECREATION_PROJECT query complete | FOUND_COUNT={} | REQUESTED_COUNT={}",
      foundIds.size(), requestedIds.size());
    if (!foundIds.isEmpty()) {
      logger.info("Found IDs: {}", foundIds);
    }

    // Diagnostic: also check PROV_FOREST_USE to help identify IDs that may exist
    // as tenure files but not as recreation project records.
    var provForestUseSql = """
      select trim(upper(forest_file_id))
      from THE.PROV_FOREST_USE
      where trim(upper(forest_file_id)) in (:ids)
      """;
    var provForestUseFoundIds = new LinkedHashSet<>(this.namedParameterJdbcTemplate.query(
      provForestUseSql,
      new MapSqlParameterSource("ids", requestedIds),
      (rs, rowNum) -> rs.getString(1)
    ));
    logger.info("THE.PROV_FOREST_USE diagnostic | FOUND_COUNT={} | REQUESTED_COUNT={}",
      provForestUseFoundIds.size(), requestedIds.size());
    if (!provForestUseFoundIds.isEmpty()) {
      logger.info("Found IDs in THE.PROV_FOREST_USE: {}", provForestUseFoundIds);
    }

    Set<String> missingIds = new LinkedHashSet<>();
    Set<String> foundOnlyInProvForestUse = new LinkedHashSet<>();

    for (var id : requestedIds) {
      var status = foundIds.contains(id) ? "FOUND" : "MISSING";
      if (!foundIds.contains(id)) {
        missingIds.add(id);
        if (provForestUseFoundIds.contains(id)) {
          foundOnlyInProvForestUse.add(id);
        }
      }
      logger.info("THE.RECREATION_PROJECT check | FOREST_FILE_ID={} | STATUS={}", id, status);
    }

    if (!foundOnlyInProvForestUse.isEmpty()) {
      logger.warn("IDs missing in THE.RECREATION_PROJECT but present in THE.PROV_FOREST_USE: {}",
        foundOnlyInProvForestUse);
    }

    var missingInBoth = new ArrayList<String>();
    for (var id : missingIds) {
      if (!provForestUseFoundIds.contains(id)) {
        missingInBoth.add(id);
      }
    }
    if (!missingInBoth.isEmpty()) {
      logger.warn("IDs missing in both THE.RECREATION_PROJECT and THE.PROV_FOREST_USE: {}", missingInBoth);
    }

    logger.info("THE.RECREATION_PROJECT check summary | REQUESTED={} | FOUND={} | MISSING={} | MISSING_IDS={}",
      requestedIds.size(), foundIds.size(), missingIds.size(), missingIds);
  }
}

