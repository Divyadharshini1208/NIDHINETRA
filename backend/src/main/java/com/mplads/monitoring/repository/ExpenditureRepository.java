package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.Expenditure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenditureRepository extends JpaRepository<Expenditure, Long> {
    List<Expenditure> findByProjectId(Long projectId);
    List<Expenditure> findByProjectIdOrderByExpenditureDateDesc(Long projectId);
}
