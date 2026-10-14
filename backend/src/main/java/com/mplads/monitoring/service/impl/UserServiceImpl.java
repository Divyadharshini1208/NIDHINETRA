package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.UserResponse;
import com.mplads.monitoring.entity.User;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.mapper.UserMapper;
import com.mplads.monitoring.repository.UserRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }


    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.toUserResponse(user);
    }
}
