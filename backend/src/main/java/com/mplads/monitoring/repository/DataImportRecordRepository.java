package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.DataImportRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataImportRecordRepository extends JpaRepository<DataImportRecord, Long> {
    List<DataImportRecord> findAllByOrderByCreatedAtDesc();
}
