package ca.bc.gov.nrs.environment.fta.el.services;

import java.io.File;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import ca.bc.gov.nrs.environment.fta.el.entities.AssociatedUse;
import ca.bc.gov.nrs.environment.fta.el.entities.ProvforestNote;
import ca.bc.gov.nrs.environment.fta.el.repositories.AssociatedUseRepository;
import ca.bc.gov.nrs.environment.fta.el.repositories.ProvforestNoteRepository;
import jakarta.persistence.EntityManager;

/**
 * TEMPORARY diagnostic for the two note extracts, reached with JOB_MODE=probe.
 * Delete once they are confirmed working.
 *
 * Logs only column metadata, row counts and failure messages. It never logs a
 * column value, and it never throws, so the job completes and its pod is not
 * discarded along with the logs.
 */
@Service
public class SchemaProbeService {

  private static final Logger logger = LoggerFactory.getLogger(SchemaProbeService.class);

  private static final String SCHEMA = "THE";
  private static final String REC_FILE_PREFIX = "REC";
  /** Oracle errors are metadata, but cap them so a stray value cannot run long. */
  private static final int MAX_MESSAGE_LENGTH = 300;

  private final EntityManager entityManager;
  private final ProvforestNoteRepository provforestNoteRepository;
  private final AssociatedUseRepository associatedUseRepository;

  public SchemaProbeService(
    EntityManager entityManager,
    ProvforestNoteRepository provforestNoteRepository,
    AssociatedUseRepository associatedUseRepository
  ) {
    this.entityManager = entityManager;
    this.provforestNoteRepository = provforestNoteRepository;
    this.associatedUseRepository = associatedUseRepository;
  }

  public void run() {
    logger.info("=== schema probe start ===");

    // Columns first, so this survives in the log even if a later step kills the JVM
    describeTable("PROVFOREST_NOTE");
    describeTable("ASSOCIATED_USE");

    mapOneRow("ProvforestNote", ProvforestNote.class, "provforestNoteSkey");
    mapOneRow("AssociatedUse", AssociatedUse.class, "forestFileId");

    countAll("PROVFOREST_NOTE", () -> provforestNoteRepository
      .findByForestFileIdStartingWith(REC_FILE_PREFIX).size());
    countAll("ASSOCIATED_USE", () -> associatedUseRepository
      .findByForestFileIdStartingWith(REC_FILE_PREFIX).size());

    reportRuntime();
    logger.info("=== schema probe end ===");
  }

  /** Column names and types for one table, from Oracle's own dictionary. */
  private void describeTable(String tableName) {
    try {
      var rows = entityManager
        .createNativeQuery(
          "select column_id, column_name, data_type, data_length, nullable "
            + "from all_tab_columns where owner = ?1 and table_name = ?2 "
            + "order by column_id")
        .setParameter(1, SCHEMA)
        .setParameter(2, tableName)
        .getResultList();

      if (rows.isEmpty()) {
        logger.error("{}.{}: no columns visible. Either the table name is wrong "
          + "or this account has no grant on it", SCHEMA, tableName);
        return;
      }

      logger.info("{}.{}: {} columns", SCHEMA, tableName, rows.size());
      for (var row : rows) {
        var cells = (Object[]) row;
        logger.info("  {} {} {}({}) nullable={}",
          cells[0], cells[1], cells[2], cells[3], cells[4]);
      }
    } catch (Throwable t) {
      logFailure("describe " + tableName, t);
    }
  }

  /**
   * Reads a single row through the entity mapping, which is what surfaces a
   * wrong column name or an unconvertible type. Only the outcome is logged.
   */
  private void mapOneRow(String label, Class<?> entity, String idField) {
    try {
      var found = entityManager
        .createQuery("select e from " + entity.getSimpleName() + " e where e."
          + idField + " is not null", entity)
        .setMaxResults(1)
        .getResultList()
        .size();
      logger.info("map {}: ok, {} row(s) read", label, found);
    } catch (Throwable t) {
      logFailure("map " + label, t);
    }
  }

  /** The real extract query, to show whether volume is the problem. */
  private void countAll(String label, java.util.function.IntSupplier count) {
    try {
      logger.info("count {}: {} rows match '{}%'", label, count.getAsInt(), REC_FILE_PREFIX);
    } catch (Throwable t) {
      logFailure("count " + label, t);
    }
  }

  private void reportRuntime() {
    var runtime = Runtime.getRuntime();
    var uploads = new File(System.getenv().getOrDefault("FILE_BASE_PATH", "/uploads"));
    logger.info("heap max={}MB used={}MB, {} usable={}MB",
      runtime.maxMemory() / 1048576,
      (runtime.totalMemory() - runtime.freeMemory()) / 1048576,
      uploads.getPath(),
      uploads.getUsableSpace() / 1048576);
  }

  /** Class and message for the whole cause chain, no stack trace, no values. */
  private void logFailure(String what, Throwable t) {
    for (Throwable cause = t; cause != null; cause = cause.getCause()) {
      logger.error("{} failed: {}: {}", what,
        cause.getClass().getName(), truncate(cause.getMessage()));
      if (cause.getCause() == cause) {
        break;
      }
    }
  }

  private static String truncate(String message) {
    if (message == null) {
      return "(no message)";
    }
    var single = message.replaceAll("\\s+", " ").trim();
    return single.length() <= MAX_MESSAGE_LENGTH
      ? single
      : single.substring(0, MAX_MESSAGE_LENGTH) + "...(truncated)";
  }
}
