package com.miniecommerce.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình CORS cho phép frontend (Next.js) gọi trực tiếp các API của backend.
 * Dùng allowedOriginPatterns("*") để thỏa mọi origin (localhost, 127.0.0.1,
 * IP LAN khi demo bằng điện thoại/máy khác...) — thuận tiện cho môi trường dev.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
