
package com.finance.finance_tracker.service;

import com.finance.finance_tracker.dto.AuthResponse;
import com.finance.finance_tracker.dto.LoginRequest;
import com.finance.finance_tracker.dto.RegisterRequest;
import com.finance.finance_tracker.entity.User;
import com.finance.finance_tracker.repository.UserRepository;
import com.finance.finance_tracker.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final int VERIFIED_EXPIRY_MINUTES = 10;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    // USER REGISTRATION
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());
        String name = request.getName().trim();
        String password = request.getPassword();

        validatePasswordLength(password);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        String encodedPassword = passwordEncoder.encode(password);

        User user = new User(name, email, encodedPassword);
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getEmail());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    // USER LOGIN
    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    // STEP 1: GENERATE AND SEND OTP
    public void forgotPassword(String emailAddress) {

        String email = normalizeEmail(emailAddress);

        User user = userRepository.findByEmail(email)
                .orElse(null);

        // Do not reveal whether an account exists.
        if (user == null) {
            return;
        }

        // Generate a cryptographically secure 6-digit OTP.
        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        user.setResetOtpHash(hashOtp(otp));
        user.setResetOtpExpiry(
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)
        );

        user.setResetOtpAttempts(0);
        user.setResetOtpVerified(false);
        user.setResetOtpVerifiedExpiry(null);

        userRepository.save(user);

        // Send OTP to registered email.
        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    // STEP 2: VERIFY OTP
    public void verifyOtp(String emailAddress, String otp) {

        String email = normalizeEmail(emailAddress);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid or expired OTP"
                        )
                );

        if (user.getResetOtpHash() == null ||
                user.getResetOtpExpiry() == null ||
                !user.getResetOtpExpiry().isAfter(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "OTP has expired. Please request a new one."
            );
        }

        if (user.getResetOtpAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Maximum OTP attempts exceeded. Request a new OTP."
            );
        }

        String submittedHash = hashOtp(otp);

        boolean matches = MessageDigest.isEqual(
                submittedHash.getBytes(StandardCharsets.UTF_8),
                user.getResetOtpHash().getBytes(StandardCharsets.UTF_8)
        );

        if (!matches) {

            user.setResetOtpAttempts(
                    user.getResetOtpAttempts() + 1
            );

            if (user.getResetOtpAttempts() >= MAX_OTP_ATTEMPTS) {
                user.setResetOtpHash(null);
                user.setResetOtpExpiry(null);
            }

            userRepository.save(user);

            throw new IllegalArgumentException("Invalid OTP");
        }

        // OTP is consumed after successful verification.
        user.setResetOtpHash(null);
        user.setResetOtpExpiry(null);
        user.setResetOtpAttempts(0);

        user.setResetOtpVerified(true);
        user.setResetOtpVerifiedExpiry(
                LocalDateTime.now().plusMinutes(VERIFIED_EXPIRY_MINUTES)
        );

        userRepository.save(user);
    }

    // STEP 3: RESET PASSWORD AFTER OTP VERIFICATION
    public void resetPassword(
            String emailAddress,
            String newPassword) {

        String email = normalizeEmail(emailAddress);

        validatePasswordLength(newPassword);

        if (newPassword.length() < 8) {
            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid reset request")
                );

        if (!user.isResetOtpVerified() ||
                user.getResetOtpVerifiedExpiry() == null ||
                !user.getResetOtpVerifiedExpiry()
                        .isAfter(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Please verify your OTP before resetting your password."
            );
        }

        // Update password using BCrypt.
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear all reset information.
        user.setResetOtpHash(null);
        user.setResetOtpExpiry(null);
        user.setResetOtpAttempts(0);
        user.setResetOtpVerified(false);
        user.setResetOtpVerifiedExpiry(null);

        userRepository.save(user);
    }

    // SHA-256 HASHING
    private String hashOtp(String otp) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    otp.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to process OTP",
                    exception
            );
        }
    }

    // BCrypt supports a maximum of 72 UTF-8 bytes.
    private void validatePasswordLength(String password) {

        if (password == null ||
                password.getBytes(StandardCharsets.UTF_8).length > 72) {

            throw new IllegalArgumentException(
                    "Password must not exceed 72 UTF-8 bytes"
            );
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
