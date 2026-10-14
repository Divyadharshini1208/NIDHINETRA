package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.SimulationScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationScenarioRepository extends JpaRepository<SimulationScenario, Long> {

    List<SimulationScenario> findByCreatedByUserIdOrderByCreatedAtDesc(Long userId);

    List<SimulationScenario> findByScopeTypeAndScopeIdOrderByCreatedAtDesc(String scopeType, Long scopeId);

    List<SimulationScenario> findTop10ByOrderByCreatedAtDesc();
}
