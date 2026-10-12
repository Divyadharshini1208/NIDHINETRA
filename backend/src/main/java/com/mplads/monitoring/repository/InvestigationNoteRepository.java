package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.InvestigationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestigationNoteRepository extends JpaRepository<InvestigationNote, Long> {
    List<InvestigationNote> findByInvestigationIdOrderByCreatedAtAsc(Long investigationId);
}
