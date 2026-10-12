package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjectId(Long projectId);
    List<Document> findByProjectIdOrderByUploadedAtDesc(Long projectId);
}
