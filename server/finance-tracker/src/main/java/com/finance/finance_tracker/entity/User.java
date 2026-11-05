
package com.finance.finance_tracker.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private LocalDateTime createdAt;

    // Password reset OTP fields
    private String resetOtpHash;
    private LocalDateTime resetOtpExpiry;
    private int resetOtpAttempts;
    private boolean resetOtpVerified;
    private LocalDateTime resetOtpVerifiedExpiry;

    public User() {
    }

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getResetOtpHash() {
        return resetOtpHash;
    }

    public void setResetOtpHash(String resetOtpHash) {
        this.resetOtpHash = resetOtpHash;
    }

    public LocalDateTime getResetOtpExpiry() {
        return resetOtpExpiry;
    }

    public void setResetOtpExpiry(LocalDateTime resetOtpExpiry) {
        this.resetOtpExpiry = resetOtpExpiry;
    }

    public int getResetOtpAttempts() {
        return resetOtpAttempts;
    }

    public void setResetOtpAttempts(int resetOtpAttempts) {
        this.resetOtpAttempts = resetOtpAttempts;
    }

    public boolean isResetOtpVerified() {
        return resetOtpVerified;
    }

    public void setResetOtpVerified(boolean resetOtpVerified) {
        this.resetOtpVerified = resetOtpVerified;
    }

    public LocalDateTime getResetOtpVerifiedExpiry() {
        return resetOtpVerifiedExpiry;
    }

    public void setResetOtpVerifiedExpiry(
            LocalDateTime resetOtpVerifiedExpiry) {
        this.resetOtpVerifiedExpiry = resetOtpVerifiedExpiry;
    }
}
