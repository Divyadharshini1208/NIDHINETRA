package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.RiskNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskNotificationRepository extends JpaRepository<RiskNotification, Long> {

    List<RiskNotification> findTop20ByOrderByCreatedAtDesc();

    @Query("SELECT n FROM RiskNotification n WHERE (:stateId IS NULL OR n.stateId = :stateId) " +
           "AND (:districtId IS NULL OR n.districtId = :districtId) ORDER BY n.createdAt DESC")
    Page<RiskNotification> findScopedNotifications(@Param("stateId") Long stateId, 
                                                   @Param("districtId") Long districtId, 
                                                   Pageable pageable);

    @Query("SELECT COUNT(n) FROM RiskNotification n WHERE n.isRead = false " +
           "AND (:stateId IS NULL OR n.stateId = :stateId) " +
           "AND (:districtId IS NULL OR n.districtId = :districtId)")
    long countUnread(@Param("stateId") Long stateId, @Param("districtId") Long districtId);

    @Modifying
    @Query("UPDATE RiskNotification n SET n.isRead = true WHERE (:stateId IS NULL OR n.stateId = :stateId) " +
           "AND (:districtId IS NULL OR n.districtId = :districtId)")
    int markAllReadScoped(@Param("stateId") Long stateId, @Param("districtId") Long districtId);

    boolean existsByProjectIdAndTriggerRuleAndCreatedAtAfter(Long projectId, String triggerRule, java.time.LocalDateTime cutoff);
}
