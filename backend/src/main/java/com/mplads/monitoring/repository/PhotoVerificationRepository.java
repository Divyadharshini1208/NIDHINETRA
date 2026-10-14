package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.PhotoVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhotoVerificationRepository extends JpaRepository<PhotoVerification, Long> {

    List<PhotoVerification> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Optional<PhotoVerification> findFirstByFileHash(String fileHash);

    boolean existsByFileHash(String fileHash);

    long countByVerificationStatus(String verificationStatus);
}
