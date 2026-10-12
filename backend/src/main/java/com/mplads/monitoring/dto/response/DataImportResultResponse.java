package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataImportResultResponse {
    private String batchId;
    private String fileName;
    private int totalRecords;
    private int validRecords;
    private int invalidRecords;
    private int duplicateRecords;
    private boolean canProceed;
    private List<String> validationErrors;
    private List<Map<String, Object>> previewRows;
}
