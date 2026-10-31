package com.miniecommerce.web;

import com.miniecommerce.application.dto.CreateProductDto;
import com.miniecommerce.application.dto.PageResult;
import com.miniecommerce.application.dto.ProductDto;
import com.miniecommerce.application.service.ProductService;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

/**
 * API quản lý sản phẩm (RESTful).
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Lấy danh sách sản phẩm có phân trang, lọc theo giá / danh mục / từ khóa.
     * Query params: page (mặc định 1), pageSize (mặc định 10), minPrice, maxPrice, category, search
     */
    @GetMapping
    public ResponseEntity<PageResult<ProductDto>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        PageResult<ProductDto> result =
                productService.getProducts(page, pageSize, minPrice, maxPrice, category, search);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy chi tiết sản phẩm theo Id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Tạo sản phẩm mới.
     */
    @PostMapping
    public ResponseEntity<ProductDto> create(@RequestBody CreateProductDto dto) {
        ProductDto created = productService.createProduct(dto);
        return ResponseEntity.created(URI.create("/api/products/" + created.id())).body(created);
    }

    /**
     * Cập nhật sản phẩm (kèm kiểm tra Concurrency Control).
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Integer id, @RequestBody CreateProductDto dto) {
        try {
            productService.updateProduct(id, dto);
            return ResponseEntity.noContent().build();
        } catch (jakarta.persistence.OptimisticLockException e) {
            return ResponseEntity.status(409).build();
        }
    }

    /**
     * Xóa mềm sản phẩm (Soft Delete).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
