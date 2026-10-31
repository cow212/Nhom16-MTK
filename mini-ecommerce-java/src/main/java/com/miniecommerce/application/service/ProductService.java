package com.miniecommerce.application.service;

import com.miniecommerce.application.dto.PageResult;
import com.miniecommerce.application.dto.ProductDto;
import com.miniecommerce.application.dto.CreateProductDto;
import com.miniecommerce.application.exception.NotFoundException;
import com.miniecommerce.domain.entity.Product;
import com.miniecommerce.infrastructure.repository.IUnitOfWork;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service quản lý sản phẩm (Application Layer).
 */
@Service
public class ProductService {

    private final IUnitOfWork unitOfWork;

    public ProductService(IUnitOfWork unitOfWork) {
        this.unitOfWork = unitOfWork;
    }

    /**
     * Lấy danh sách sản phẩm có phân trang, lọc theo giá / danh mục / từ khóa.
     *
     * @param page     trang hiện tại (bắt đầu từ 1)
     * @param pageSize số phần tử mỗi trang
     * @param minPrice giá thấp nhất (tùy chọn)
     * @param maxPrice giá cao nhất (tùy chọn)
     * @param category danh mục, so sánh không phân biệt hoa thường (tùy chọn)
     * @param search   từ khóa tìm trong tên / mô tả, không phân biệt hoa thường (tùy chọn)
     * @return PageResult chứa danh sách sản phẩm đã phân trang
     */
    @Transactional(readOnly = true)
    public PageResult<ProductDto> getProducts(int page, int pageSize, BigDecimal minPrice, BigDecimal maxPrice,
                                              String category, String search) {
        var repo = unitOfWork.repository(Product.class);
        List<Product> allProducts = repo.findAll();

        String normalizedCategory = (category != null && !category.isBlank()) ? category.trim() : null;
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;

        // Lọc theo giá, danh mục và từ khóa tìm kiếm nếu có
        List<Product> filtered = allProducts.stream()
                .filter(p -> minPrice == null || p.getPrice().compareTo(minPrice) >= 0)
                .filter(p -> maxPrice == null || p.getPrice().compareTo(maxPrice) <= 0)
                .filter(p -> normalizedCategory == null
                        || normalizedCategory.equalsIgnoreCase(p.getCategory()))
                .filter(p -> normalizedSearch == null
                        || p.getName().toLowerCase().contains(normalizedSearch)
                        || (p.getDescription() != null
                                && p.getDescription().toLowerCase().contains(normalizedSearch)))
                .collect(Collectors.toList());

        long totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        // Tính chỉ số bắt đầu và kết thúc cho trang hiện tại
        int fromIndex = (page - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, filtered.size());

        List<Product> pagedContent;
        if (fromIndex >= filtered.size() || fromIndex < 0) {
            pagedContent = new ArrayList<>();
        } else {
            pagedContent = filtered.subList(fromIndex, toIndex);
        }

        List<ProductDto> content = pagedContent.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new PageResult<>(page, pageSize, totalElements, totalPages, content);
    }

    /**
     * Lấy chi tiết sản phẩm theo Id.
     */
    @Transactional(readOnly = true)
    public ProductDto getProductById(Integer id) {
        Product product = unitOfWork.repository(Product.class).findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm có Id = " + id));
        return toDto(product);
    }

    /**
     * Tạo sản phẩm mới.
     */
    @Transactional
    public ProductDto createProduct(CreateProductDto dto) {
        Product product = new Product();
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setStockQuantity(dto.stockQuantity());
        product.setSku(dto.sku());
        product.setCategory(dto.category());
        product.setActive(true);

        unitOfWork.repository(Product.class).save(product);
        unitOfWork.commit();

        return toDto(product);
    }

    /**
     * Cập nhật sản phẩm (kèm kiểm tra Concurrency Control qua @Version/row_version).
     */
    @Transactional
    public ProductDto updateProduct(Integer id, CreateProductDto dto) {
        Product product = unitOfWork.repository(Product.class).findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm có Id = " + id));

        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setStockQuantity(dto.stockQuantity());
        product.setSku(dto.sku());
        product.setCategory(dto.category());

        unitOfWork.repository(Product.class).save(product);
        unitOfWork.commit();

        return toDto(product);
    }

    /**
     * Xóa mềm sản phẩm (Soft Delete).
     */
    @Transactional
    public void deleteProduct(Integer id) {
        if (!unitOfWork.repository(Product.class).existsById(id)) {
            throw new NotFoundException("Không tìm thấy sản phẩm có Id = " + id);
        }
        unitOfWork.repository(Product.class).softDelete(id);
        unitOfWork.commit();
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getStockQuantity(),
                p.getSku(),
                p.getCategory(),
                p.getImageUrl(),
                p.isActive()
        );
    }
}
