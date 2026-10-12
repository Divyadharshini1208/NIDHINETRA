package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.RiskAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long>, JpaSpecificationExecutor<RiskAlert> {
    List<RiskAlert> findByProjectId(Long projectId);
    List<RiskAlert> findByStatus(String status);
    List<RiskAlert> findTop10ByOrderByDetectedAtDesc();
    long countBySeverity(String severity);
    long countByStatus(String status);
}
