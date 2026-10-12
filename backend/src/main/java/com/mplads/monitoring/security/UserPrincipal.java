package com.mplads.monitoring.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mplads.monitoring.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Getter
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    @JsonIgnore
    private String password;
    private String fullName;
    private String role;
    private Long stateId;
    private Long districtId;
    private Long constituencyId;
    private boolean isActive;
    private boolean isApproved;
    private String accountStatus;
    private String clearanceStatus;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole().getName().name())
        );

        boolean active = Boolean.TRUE.equals(user.getIsActive()) &&
                !"INACTIVE".equalsIgnoreCase(user.getAccountStatus()) &&
                !"REVOKED".equalsIgnoreCase(user.getAccountStatus()) &&
                !"REJECTED".equalsIgnoreCase(user.getAccountStatus());

        boolean approved = Boolean.TRUE.equals(user.getIsApproved()) &&
                "APPROVED".equalsIgnoreCase(user.getClearanceStatus());

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword())
                .fullName(user.getFullName())
                .role(user.getRole().getName().name())
                .stateId(user.getState() != null ? user.getState().getId() : null)
                .districtId(user.getDistrict() != null ? user.getDistrict().getId() : null)
                .constituencyId(user.getConstituency() != null ? user.getConstituency().getId() : null)
                .isActive(active)
                .isApproved(approved)
                .accountStatus(user.getAccountStatus())
                .clearanceStatus(user.getClearanceStatus())
                .authorities(authorities)
                .build();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !"REVOKED".equalsIgnoreCase(accountStatus) && !"REJECTED".equalsIgnoreCase(accountStatus);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive && isApproved;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPrincipal that = (UserPrincipal) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
