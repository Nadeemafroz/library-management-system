package com.luv2code.springbootlibrary.filter;

import com.luv2code.springbootlibrary.jwt.JwtUtil;
import com.luv2code.springbootlibrary.service.MyUserDetailsService;
import com.luv2code.springbootlibrary.service.UserService;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException, java.io.IOException {

         if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }       

        // Get the Authorization header from the request
        String authorizationHeader = request.getHeader("Authorization");

        String jwtToken = null;
        String username = null;

        // Check if the Authorization header is present and starts with "Bearer"
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7); // Remove "Bearer " prefix
            try {
                // Extract the username (email) from the JWT token
                username = jwtUtil.extractEmail(jwtToken);
            } catch (Exception e) {
                logger.error("Unable to extract email from token: {}", e);  // Pass the exception object, not just the message
            }
        }

        // If a username is extracted and no authentication is set in the security context, authenticate the user
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load the user details from the database based on the extracted username
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate the token
            if (jwtUtil.validateToken(jwtToken)) {
                // Create the authentication token
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                // Set the authentication details (like the request)
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authentication context
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }

        // Continue with the filter chain
        chain.doFilter(request, response);
    }
}
