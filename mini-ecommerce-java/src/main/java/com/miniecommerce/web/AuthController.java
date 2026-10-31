package com.miniecommerce.web;

import com.miniecommerce.application.dto.AuthResponse;
import com.miniecommerce.application.dto.LoginRequest;
import com.miniecommerce.application.dto.MeResponse;
import com.miniecommerce.application.dto.RegisterRequest;
import com.miniecommerce.application.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * API xác thực (đăng ký / đăng nhập / ai đang đăng nhập).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Đăng ký tài khoản mới. Body: { fullName, username, email, password, phoneNumber, address }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest dto) {
        return ResponseEntity.ok(authService.register(dto));
    }

    /**
     * Đăng nhập bằng username hoặc email. Body: { usernameOrEmail, password }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    /**
     * Thông tin người dùng đang đăng nhập (gửi header Authorization: Bearer {token}).
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(authService.me(authHeader));
    }
}
