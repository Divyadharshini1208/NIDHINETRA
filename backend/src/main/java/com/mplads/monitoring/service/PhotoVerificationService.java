package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.PhotoVerificationResponse;
import com.mplads.monitoring.security.UserPrincipal;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PhotoVerificationService {

    PhotoVerificationResponse verifyProjectPhoto(
            UserPrincipal currentUser,
            Long projectId,
            MultipartFile file,
            Double providedLat,
            Double providedLon
    );

    List<PhotoVerificationResponse> getVerificationsByProject(Long projectId);
}
