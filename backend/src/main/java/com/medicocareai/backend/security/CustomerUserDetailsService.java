package com.medicocareai.backend.security;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.repository.UserRepository;

@Service
public class CustomerUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomerUserDetailsService(
            UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String roleName = user.getRole() != null ? user.getRole().getName() : "USER";

        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + roleName);

        boolean enabled = "ACTIVE".equals(user.getStatus());

        return new CustomUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                java.util.List.of(authority),
                enabled);
    }

}
