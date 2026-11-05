
package com.finance.finance_tracker.security;

import com.finance.finance_tracker.entity.User;
import com.finance.finance_tracker.repository.UserRepository;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository) {

        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Get Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Continue if no Bearer token is provided
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            // Extract email from JWT
            String email = jwtService.extractEmail(token);

            // Authenticate only if not already authenticated
            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                // Find user in MongoDB
                User user = userRepository.findByEmail(email)
                        .orElse(null);

                // Validate token against the user
                if (user != null &&
                        jwtService.isTokenValid(token, user.getEmail())) {

                    // Create authentication object

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    Collections.emptyList()
                            );


                    // Attach request details
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    // Store authentication in SecurityContext
                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (JwtException | IllegalArgumentException exception) {

            // Invalid or expired token
            SecurityContextHolder.clearContext();
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
