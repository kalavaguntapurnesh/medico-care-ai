package com.medicocareai.backend.security;

import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomUserPrincipal implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String password;
    private final boolean enabled;

    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserPrincipal(
            UUID userId,
            String email,
            String password,
            Collection<? extends GrantedAuthority> authorities,
            boolean enabled) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.enabled = enabled;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
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
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

}
