
package com.finance.finance_tracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetOtp(String recipient, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipient);
        message.setSubject("FinanceFlow - Password Reset OTP");

        message.setText(
                "Hello,\n\n" +
                        "We received a request to reset your FinanceFlow password.\n\n" +
                        "Your 6-digit verification code is:\n\n" +
                        otp + "\n\n" +
                        "This code expires in 5 minutes and can only be used once.\n\n" +
                        "If you did not request this code, please ignore this email.\n\n" +
                        "Regards,\nFinanceFlow Team"
        );

        mailSender.send(message);
    }
}
