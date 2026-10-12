package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectCategoryRepository extends JpaRepository<ProjectCategory, Long> {
    Optional<ProjectCategory> findByCode(String code);
    Optional<ProjectCategory> findByName(String name);
}
