package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.ExpenditureRequest;
import com.mplads.monitoring.dto.request.FundReleaseRequest;
import com.mplads.monitoring.dto.request.PaymentRequest;
import com.mplads.monitoring.dto.request.SanctionRequest;
import com.mplads.monitoring.dto.response.*;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.FinancialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financials")
@Tag(name = "Financial Operations", description = "REST APIs for sanctions, fund releases, expenditures, payments, and summaries")
@SecurityRequirement(name = "BearerAuth")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }


    @GetMapping("/summary")
    @Operation(summary = "Get overall role-scoped financial summary (Sanctioned, Released, Expenditure, Utilization %)")
    public ResponseEntity<ApiResponse<FinancialSummaryResponse>> getFinancialSummary(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        FinancialSummaryResponse response = financialService.getFinancialSummary(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Financial summary retrieved successfully", response));
    }

    @PostMapping("/sanctions")
    @Operation(summary = "Record a new project sanction order")
    public ResponseEntity<ApiResponse<SanctionResponse>> createSanction(
            @Valid @RequestBody SanctionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        SanctionResponse response = financialService.createSanction(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Sanction order recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/sanctions/{projectId}")
    @Operation(summary = "Get all sanction orders for a project")
    public ResponseEntity<ApiResponse<List<SanctionResponse>>> getSanctions(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<SanctionResponse> response = financialService.getSanctionsByProject(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Sanctions retrieved", response));
    }

    @PostMapping("/fund-releases")
    @Operation(summary = "Record an installment fund release")
    public ResponseEntity<ApiResponse<FundReleaseResponse>> createFundRelease(
            @Valid @RequestBody FundReleaseRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        FundReleaseResponse response = financialService.createFundRelease(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Fund release recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/fund-releases/{projectId}")
    @Operation(summary = "Get all fund releases for a project")
    public ResponseEntity<ApiResponse<List<FundReleaseResponse>>> getFundReleases(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<FundReleaseResponse> response = financialService.getFundReleasesByProject(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Fund releases retrieved", response));
    }

    @PostMapping("/expenditures")
    @Operation(summary = "Record a voucher expenditure entry")
    public ResponseEntity<ApiResponse<ExpenditureResponse>> createExpenditure(
            @Valid @RequestBody ExpenditureRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ExpenditureResponse response = financialService.createExpenditure(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Expenditure entry recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/expenditures/{projectId}")
    @Operation(summary = "Get all expenditure entries for a project")
    public ResponseEntity<ApiResponse<List<ExpenditureResponse>>> getExpenditures(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<ExpenditureResponse> response = financialService.getExpendituresByProject(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Expenditures retrieved", response));
    }

    @PostMapping("/payments")
    @Operation(summary = "Record a vendor/payee transaction payment (PFMS / Treasury)")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PaymentResponse response = financialService.createPayment(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Payment transaction recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/payments/{projectId}")
    @Operation(summary = "Get all payment transactions for a project")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPayments(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<PaymentResponse> response = financialService.getPaymentsByProject(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Payments retrieved", response));
    }
}
