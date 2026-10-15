package ca.bc.gov.nrs.environment.fta.el.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import ca.bc.gov.nrs.environment.fta.el.entities.ProvforestNote;

public interface ProvforestNoteRepository extends JpaRepository<ProvforestNote, Long> {
  List<ProvforestNote> findByForestFileIdStartingWith(String prefix);
}
