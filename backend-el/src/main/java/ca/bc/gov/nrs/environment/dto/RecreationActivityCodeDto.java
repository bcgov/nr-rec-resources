package ca.bc.gov.nrs.environment.dto;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link ca.bc.gov.nrs.environment.entities.RecreationActivityCode}
 */
public record RecreationActivityCodeDto(String recreationActivityCode, String description, LocalDate effectiveDate, LocalDate expiryDate, LocalDate updateTimestamp) implements Serializable {
}
