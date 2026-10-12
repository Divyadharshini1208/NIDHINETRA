package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.ExpenditureRequest;
import com.mplads.monitoring.dto.request.FundReleaseRequest;
import com.mplads.monitoring.dto.request.PaymentRequest;
import com.mplads.monitoring.dto.request.SanctionRequest;
import com.mplads.monitoring.dto.response.*;
import com.mplads.monitoring.security.UserPrincipal;

import java.util.List;

public interface FinancialService {

    ProjectFinancialsResponse getProjectFinancials(Long projectId, UserPrincipal currentUser);

    FinancialSummaryResponse getFinancialSummary(UserPrincipal currentUser);

    SanctionResponse createSanction(SanctionRequest request, UserPrincipal currentUser);

    List<SanctionResponse> getSanctionsByProject(Long projectId, UserPrincipal currentUser);

    FundReleaseResponse createFundRelease(FundReleaseRequest request, UserPrincipal currentUser);

    List<FundReleaseResponse> getFundReleasesByProject(Long projectId, UserPrincipal currentUser);

    ExpenditureResponse createExpenditure(ExpenditureRequest request, UserPrincipal currentUser);

    List<ExpenditureResponse> getExpendituresByProject(Long projectId, UserPrincipal currentUser);

    PaymentResponse createPayment(PaymentRequest request, UserPrincipal currentUser);

    List<PaymentResponse> getPaymentsByProject(Long projectId, UserPrincipal currentUser);
}
