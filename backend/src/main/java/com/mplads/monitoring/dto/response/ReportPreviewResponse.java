package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportPreviewResponse {
    private String reportType;
    private String title;
    private String generatedAt;
    private String scope;
    private Map<String, Object> summaryMetrics;
    private List<String> columns;
    private List<Map<String, Object>> rows;
}
