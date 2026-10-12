package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.Constituency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConstituencyRepository extends JpaRepository<Constituency, Long> {
    List<Constituency> findByDistrictId(Long districtId);
    Optional<Constituency> findByCode(String code);
}
