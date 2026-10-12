package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.RoleName;
import com.mplads.monitoring.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRoleName(RoleName roleName);
    List<User> findByStateId(Long stateId);
    List<User> findByDistrictId(Long districtId);

    @Query("SELECT COUNT(u) FROM User u")
    long countTotalUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.accountStatus = 'ACTIVE'")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isApproved = true AND u.clearanceStatus = 'APPROVED'")
    long countApprovedUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.clearanceStatus = 'PENDING' OR u.accountStatus = 'PENDING' OR u.isApproved = false")
    long countPendingUsers();
}
