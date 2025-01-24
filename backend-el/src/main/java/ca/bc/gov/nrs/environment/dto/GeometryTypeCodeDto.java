package ca.bc.gov.nrs.environment.dto;

import ca.bc.gov.nrs.environment.entities.GeometryTypeCode;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link GeometryTypeCode}
 */
public record GeometryTypeCodeDto(String geometryTypeCode, String description, LocalDate effectiveDate, LocalDate expiryDate, LocalDate updateTimestamp) implements Serializable {
}
