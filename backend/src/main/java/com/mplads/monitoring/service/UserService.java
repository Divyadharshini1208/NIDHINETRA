package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.UserResponse;
import com.mplads.monitoring.security.UserPrincipal;

public interface UserService {
    UserResponse getCurrentUserProfile(UserPrincipal principal);
    UserResponse getUserById(Long id);
}
