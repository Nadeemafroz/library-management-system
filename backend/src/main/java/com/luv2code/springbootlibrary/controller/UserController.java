package com.luv2code.springbootlibrary.controller;

import com.luv2code.springbootlibrary.entity.User;
import com.luv2code.springbootlibrary.dao.UserRepository;
import com.luv2code.springbootlibrary.jwt.JwtUtil;
import com.luv2code.springbootlibrary.requestmodels.LoginRequest;
import com.luv2code.springbootlibrary.requestmodels.RegisterRequest;
import com.luv2code.springbootlibrary.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request.getEmail(), request.getPassword());
    }

    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

    Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

    if (userOptional.isEmpty()) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
    }

    User user = userOptional.get();

    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid email or password");
    }

    String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
    return ResponseEntity.ok(token);
}

}