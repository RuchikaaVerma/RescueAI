package com.rescueai.os.service;

import com.rescueai.os.domain.entity.Tenant;
import com.rescueai.os.domain.entity.User;
import com.rescueai.os.dto.request.LoginRequest;
import com.rescueai.os.dto.request.RegisterRequest;
import com.rescueai.os.dto.response.AuthResponse;
import com.rescueai.os.exception.ApiException;
import com.rescueai.os.repository.TenantRepository;
import com.rescueai.os.repository.UserRepository;
import com.rescueai.os.security.JwtService;
import com.rescueai.os.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        Tenant tenant = tenantRepository.findBySlug(request.getTenantSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Unknown tenant: " + request.getTenantSlug()));

        User user = User.builder()
                .tenant(tenant)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .build();

        userRepository.save(user);

        SecurityUser securityUser = new SecurityUser(user);
        String token = jwtService.generateToken(securityUser, Map.of(
                "role", user.getRole().name(),
                "tenantSlug", tenant.getSlug(),
                "userId", user.getId().toString()
        ));

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .tenantSlug(tenant.getSlug())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        SecurityUser securityUser = new SecurityUser(user);
        String token = jwtService.generateToken(securityUser, Map.of(
                "role", user.getRole().name(),
                "tenantSlug", user.getTenant().getSlug(),
                "userId", user.getId().toString()
        ));

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .tenantSlug(user.getTenant().getSlug())
                .build();
    }
}
