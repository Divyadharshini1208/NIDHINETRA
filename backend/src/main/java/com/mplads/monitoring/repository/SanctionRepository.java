package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.Sanction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SanctionRepository extends JpaRepository<Sanction, Long> {
    List<Sanction> findByProjectId(Long projectId);
    List<Sanction> findByProjectIdOrderBySanctionDateDesc(Long projectId);
}
