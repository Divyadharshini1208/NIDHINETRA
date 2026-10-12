package com.mplads.monitoring.repository;

import com.mplads.monitoring.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByProjectId(Long projectId);
    List<Payment> findByProjectIdOrderByPaymentDateDesc(Long projectId);
    Optional<Payment> findByPaymentReference(String paymentReference);
}
