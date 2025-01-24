package ca.bc.gov.nrs.environment.dto;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link ca.bc.gov.nrs.environment.entities.RecreationAccessCode}
 */
public record RecreationAccessCodeDto(String recreationAccessCode, String description, LocalDate effectiveDate, LocalDate expiryDate, LocalDate updateTimestamp) implements Serializable {
}
