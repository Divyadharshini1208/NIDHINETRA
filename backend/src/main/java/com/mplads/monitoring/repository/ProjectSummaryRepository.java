package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.ProjectSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectSummaryRepository extends JpaRepository<ProjectSummary, Long> {
    Optional<ProjectSummary> findByProjectCode(String projectCode);
    List<ProjectSummary> findByStateId(Long stateId);
    List<ProjectSummary> findByDistrictId(Long districtId);
    List<ProjectSummary> findByConstituencyId(Long constituencyId);
    List<ProjectSummary> findByStatus(String status);
    List<ProjectSummary> findByRiskLevel(String riskLevel);

    @Query("SELECT COUNT(p) FROM ProjectSummary p WHERE p.status = 'COMPLETED'")
    Long countCompletedProjects();

    @Query("SELECT COUNT(p) FROM ProjectSummary p WHERE p.status = 'ONGOING'")
    Long countOngoingProjects();

    @Query("SELECT COUNT(p) FROM ProjectSummary p WHERE p.status = 'DELAYED'")
    Long countDelayedProjects();

    @Query("SELECT COALESCE(SUM(p.sanctionedAmountLakhs), 0.0) FROM ProjectSummary p")
    Double sumTotalSanctionedLakhs();

    @Query("SELECT COALESCE(SUM(p.expenditureAmountLakhs), 0.0) FROM ProjectSummary p")
    Double sumTotalExpenditureLakhs();
}
