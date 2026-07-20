package com.rescueai.os.dto.request;

import com.rescueai.os.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String tenantSlug;
    @NotBlank private String fullName;
    @Email @NotBlank private String email;
    @NotBlank private String password;
    @NotBlank private String phoneNumber;
    @NotNull private Role role;
}
