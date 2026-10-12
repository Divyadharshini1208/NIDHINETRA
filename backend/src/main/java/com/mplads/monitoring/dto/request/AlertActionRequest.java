package com.mplads.monitoring.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertActionRequest {
    private String status; // NEW, UNDER_REVIEW, INVESTIGATING, RESOLVED, DISMISSED
    private String assigneeName;
    private String noteText;
    private String escalationReason;
    private String priority; // NORMAL, HIGH, URGENT
    private String documentTitle;
    private String documentUrl;
}
