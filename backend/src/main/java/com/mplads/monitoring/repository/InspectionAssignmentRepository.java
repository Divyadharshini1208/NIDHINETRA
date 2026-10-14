package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.InspectionAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionAssignmentRepository extends JpaRepository<InspectionAssignment, Long> {

    List<InspectionAssignment> findByDistrictId(Long districtId);

    @EntityGraph(attributePaths = {"project"})
    Page<InspectionAssignment> findByDistrictId(Long districtId, Pageable pageable);

    @EntityGraph(attributePaths = {"project"})
    @Query("SELECT i FROM InspectionAssignment i WHERE i.districtId = :districtId ORDER BY i.createdAt DESC")
    List<InspectionAssignment> findByDistrictIdOrderByCreatedAtDesc(@Param("districtId") Long districtId);

    @EntityGraph(attributePaths = {"project"})
    @Query("SELECT i FROM InspectionAssignment i ORDER BY i.createdAt DESC")
    List<InspectionAssignment> findAllOrderByCreatedAtDesc();

    Optional<InspectionAssignment> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);

    long countByDistrictIdAndStatus(Long districtId, String status);

    @Query("SELECT COUNT(i) FROM InspectionAssignment i WHERE i.districtId = :districtId AND i.completedAt >= :startDate")
    long countCompletedInDistrictSince(@Param("districtId") Long districtId, @Param("startDate") java.time.LocalDateTime startDate);

    @Query("SELECT COUNT(i) FROM InspectionAssignment i WHERE i.districtId = :districtId AND i.priorityRank IN ('URGENT', 'HIGH') AND i.status != 'COMPLETED'")
    long countHighPriorityPendingInDistrict(@Param("districtId") Long districtId);
}
