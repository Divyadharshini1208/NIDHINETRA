package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.LoginRequest;
import com.mplads.monitoring.dto.request.RegisterRequest;
import com.mplads.monitoring.dto.response.AuthResponse;
import com.mplads.monitoring.dto.response.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest, String ipAddress);
    UserResponse register(RegisterRequest registerRequest, String ipAddress);
}
