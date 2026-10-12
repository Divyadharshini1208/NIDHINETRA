package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {

    @Override
    @EntityGraph(attributePaths = {"state", "district", "constituency", "category", "mpUser"})
    Page<Project> findAll(Specification<Project> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"state", "district", "constituency", "category", "mpUser"})
    Optional<Project> findById(Long id);

    Optional<Project> findByProjectId(String projectId);

    boolean existsByProjectId(String projectId);

    List<Project> findByStateId(Long stateId);

    List<Project> findByDistrictId(Long districtId);

    List<Project> findByConstituencyId(Long constituencyId);

    List<Project> findByMpUserId(Long mpUserId);

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByRiskLevel(String riskLevel);

    @Query("SELECT p FROM Project p WHERE p.state.id = :stateId")
    Page<Project> findByStateId(@Param("stateId") Long stateId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.district.id = :districtId")
    Page<Project> findByDistrictId(@Param("districtId") Long districtId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.constituency.id = :constituencyId")
    Page<Project> findByConstituencyId(@Param("constituencyId") Long constituencyId, Pageable pageable);

    @Query("SELECT p.categoryName, COUNT(p) FROM Project p GROUP BY p.categoryName")
    List<Object[]> countProjectsByCategory();

    @Query("SELECT p.status, COUNT(p) FROM Project p GROUP BY p.status")
    List<Object[]> countProjectsByStatus();

    @Query("SELECT p.riskLevel, COUNT(p) FROM Project p GROUP BY p.riskLevel")
    List<Object[]> countProjectsByRiskLevel();
}
