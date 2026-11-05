
package com.finance.finance_tracker.controller;

import com.finance.finance_tracker.dto.AuthResponse;
import com.finance.finance_tracker.dto.LoginRequest;
import com.finance.finance_tracker.dto.RegisterRequest;
import com.finance.finance_tracker.dto.ForgotPasswordRequest;
import com.finance.finance_tracker.dto.VerifyOtpRequest;
import com.finance.finance_tracker.dto.ResetPasswordRequest;

import com.finance.finance_tracker.service.AuthService;
import com.finance.finance_tracker.entity.User;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // USER REGISTRATION
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // USER LOGIN
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    // STEP 1: SEND OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request.getEmail());

        return ResponseEntity.ok(Map.of(
                "message",
                "If an account exists for that email, an OTP has been sent."
        ));
    }

    // STEP 2: VERIFY OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        authService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        return ResponseEntity.ok(Map.of(
                "message",
                "OTP verified successfully. You can now reset your password."
        ));
    }

    // STEP 3: RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(
                request.getEmail(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(Map.of(
                "message",
                "Password has been reset successfully."
        ));
    }

    // GET LOGGED-IN USER PROFILE
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal User user) {

        Map<String, Object> response = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}
