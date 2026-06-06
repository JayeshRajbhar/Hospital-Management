package com.example.hospital.controller;

import com.example.hospital.entity.AppUser;
import com.example.hospital.repository.AppUserRepository;
import com.example.hospital.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "https://hospital-management-five-pearl.vercel.app"})
public class AuthController {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required");
        }

        if (userRepository.findByUsername(username.trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(username.trim());
        user.setPassword(passwordEncoder.encode(password));
        
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required");
        }

        AppUser user = userRepository.findByUsername(username.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }

        String token = jwtService.generateToken(user.getUsername());
        user.setToken(token);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", user.getUsername()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    userRepository.findByUsername(username).ifPresent(user -> {
                        if (token.equals(user.getToken())) {
                            user.setToken(null);
                            userRepository.save(user);
                        }
                    });
                }
            } catch (Exception e) {
                // Ignore token exceptions during logout
            }
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtService.extractUsername(token);
                if (username != null) {
                    AppUser user = userRepository.findByUsername(username).orElse(null);
                    if (user != null && token.equals(user.getToken())) {
                        userRepository.delete(user);
                        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
                    }
                }
            } catch (Exception e) {
                // Fail silently or ignore
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication session");
    }
}
