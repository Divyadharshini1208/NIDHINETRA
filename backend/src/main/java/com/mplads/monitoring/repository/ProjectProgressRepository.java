package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.ProjectProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectProgressRepository extends JpaRepository<ProjectProgress, Long> {
    List<ProjectProgress> findByProjectId(Long projectId);
    List<ProjectProgress> findByProjectIdOrderByReportingDateDesc(Long projectId);
}
