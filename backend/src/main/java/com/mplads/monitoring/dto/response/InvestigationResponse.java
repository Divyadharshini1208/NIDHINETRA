package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestigationResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private Long riskAlertId;
    private String caseNumber;
    private String investigatorName;
    private String status;
    private String priority;
    private LocalDate assignedDate;
    private LocalDate completionDate;
    private String findingsSummary;
    private List<InvestigationNoteDto> notes;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InvestigationNoteDto {
        private Long id;
        private String authorName;
        private String authorRole;
        private String noteText;
        private LocalDateTime createdAt;
    }
}
