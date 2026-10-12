package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.FundRelease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FundReleaseRepository extends JpaRepository<FundRelease, Long> {
    List<FundRelease> findByProjectId(Long projectId);
    List<FundRelease> findByProjectIdOrderByReleaseDateAsc(Long projectId);
}
