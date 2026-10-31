package com.miniecommerce.application.service;

import com.miniecommerce.application.dto.AuthResponse;
import com.miniecommerce.application.dto.LoginRequest;
import com.miniecommerce.application.dto.MeResponse;
import com.miniecommerce.application.dto.RegisterRequest;
import com.miniecommerce.application.exception.BadRequestException;
import com.miniecommerce.application.exception.NotFoundException;
import com.miniecommerce.domain.entity.User;
import com.miniecommerce.infrastructure.repository.IUnitOfWork;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Service xác thực: đăng ký, đăng nhập và xác minh token.
 * <p>
 * Demo tối giản không dùng Spring Security:
 *   - Mật khẩu lưu dạng "salt:hash" (SHA-256 + salt ngẫu nhiên).
 *   - Token là chuỗi tự ký HMAC-SHA256 (mini JWT), hạn 7 ngày.
 */
@Service
public class AuthService {

    private static final String TOKEN_SECRET = "mini-ecommerce-demo-secret-key";
    private static final long TOKEN_TTL_MS = 7L * 24 * 60 * 60 * 1000; // 7 ngày

    private final IUnitOfWork unitOfWork;

    public AuthService(IUnitOfWork unitOfWork) {
        this.unitOfWork = unitOfWork;
    }

    // ==================== ĐĂNG KÝ ====================

    @Transactional
    public AuthResponse register(RegisterRequest dto) {
        if (dto.fullName() == null || dto.fullName().isBlank()
                || dto.username() == null || dto.username().isBlank()
                || dto.email() == null || dto.email().isBlank()
                || dto.password() == null || dto.password().length() < 6) {
            throw new BadRequestException(
                    "Vui lòng điền đầy đủ thông tin (mật khẩu ít nhất 6 ký tự).");
        }

        String username = dto.username().trim().toLowerCase();
        String email = dto.email().trim().toLowerCase();

        // Kiểm tra trùng username / email
        boolean duplicated = unitOfWork.repository(User.class).findAll().stream()
                .anyMatch(u -> username.equals(u.getUsername()) || email.equals(u.getEmail()));
        if (duplicated) {
            throw new BadRequestException("Tên đăng nhập hoặc email đã tồn tại.");
        }

        User user = new User();
        user.setFullName(dto.fullName().trim());
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(hashPassword(dto.password()));
        user.setPhoneNumber(dto.phoneNumber());
        user.setAddress(dto.address());
        user.setRole("Customer");
        unitOfWork.repository(User.class).save(user);
        unitOfWork.commit();

        return toResponse(user);
    }

    // ==================== ĐĂNG NHẬP ====================

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest dto) {
        if (dto.usernameOrEmail() == null || dto.usernameOrEmail().isBlank()
                || dto.password() == null || dto.password().isBlank()) {
            throw new BadRequestException("Vui lòng nhập tên đăng nhập và mật khẩu.");
        }

        String identifier = dto.usernameOrEmail().trim().toLowerCase();
        User user = unitOfWork.repository(User.class).findAll().stream()
                .filter(u -> identifier.equals(u.getUsername()) || identifier.equals(u.getEmail()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException(
                        "Tài khoản không tồn tại hoặc sai thông tin đăng nhập."));

        if (!verifyPassword(dto.password(), user.getPasswordHash())) {
            throw new BadRequestException("Tài khoản không tồn tại hoặc sai mật khẩu.");
        }

        return toResponse(user);
    }

    // ==================== WHO AM I ====================

    @Transactional(readOnly = true)
    public MeResponse me(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadRequestException("Thiếu token xác thực.");
        }
        int userId = parseUserIdFromToken(authHeader.substring(7));
        User user = unitOfWork.repository(User.class).findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng của token này."));
        return new MeResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getAddress()
        );
    }

    // ==================== TOKEN (MINI JWT) ====================

    private String generateToken(User user) {
        long exp = System.currentTimeMillis() + TOKEN_TTL_MS;
        String payload = user.getId() + "|" + user.getUsername() + "|" + exp;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encodedPayload + "." + hmac(encodedPayload);
    }

    private int parseUserIdFromToken(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            throw new BadRequestException("Token không hợp lệ.");
        }
        byte[] expected = hmacToBytes(parts[0]);
        byte[] provided = Base64.getUrlDecoder().decode(parts[1]);
        if (!MessageDigest.isEqual(expected, provided)) {
            throw new BadRequestException("Token không hợp lệ (sai chữ ký).");
        }

        String payload = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
        String[] fields = payload.split("\\|");
        long exp = Long.parseLong(fields[2]);
        if (exp < System.currentTimeMillis()) {
            throw new BadRequestException("Đã hết phiên đăng nhập, vui lòng đăng nhập lại.");
        }
        return Integer.parseInt(fields[0]);
    }

    private byte[] hmacToBytes(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(TOKEN_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Không thể ký/xác minh token.", e);
        }
    }

    private String hmac(String data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacToBytes(data));
    }

    // ==================== MẬT KHẨU (SHA-256 + salt) ====================

    private String hashPassword(String password) {
        String salt = newSecureSalt();
        return salt + ":" + sha256(salt + ":" + password);
    }

    private boolean verifyPassword(String password, String stored) {
        if (stored == null || !stored.contains(":")) {
            return false;
        }
        String[] parts = stored.split(":", 2);
        String expected = sha256(parts[0] + ":" + password);
        // So sánh an toàn tránh timing attack
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                parts[1].getBytes(StandardCharsets.UTF_8));
    }

    private String sha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Máy không hỗ trợ SHA-256.", e);
        }
    }

    private String newSecureSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return HexFormat.of().formatHex(salt);
    }

    // ==================== MAPPER ====================

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                generateToken(user),
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
