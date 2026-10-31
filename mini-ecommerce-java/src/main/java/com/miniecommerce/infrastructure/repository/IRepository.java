package com.miniecommerce.infrastructure.repository;

import com.miniecommerce.domain.entity.BaseEntity;

import java.util.List;
import java.util.Optional;

/**
 * Generic Repository interface.
 * Thao tác dữ liệu cơ bản cho mọi Entity (kế thừa BaseEntity).
 * Tất cả các truy vấn tự động loại bỏ các bản ghi đã Soft Delete (isDeleted = true).
 */
public interface IRepository<T extends BaseEntity> {

    /**
     * Lấy entity theo Id (bỏ qua đã xóa mềm).
     */
    Optional<T> findById(Integer id);

    /**
     * Lấy tất cả entity đang hoạt động (chưa bị xóa mềm).
     */
    List<T> findAll();

    /**
     * Lưu entity (INSERT hoặc UPDATE tùy theo Id có null hay không).
     */
    T save(T entity);

    /**
     * Xóa vĩnh viễn entity khỏi DB (Hard Delete).
     */
    void delete(T entity);

    /**
     * Xóa mềm entity theo Id (đặt isDeleted = true, deletedAt = giờ hiện tại).
     */
    void softDelete(Integer id);

    /**
     * Kiểm tra có tồn tại entity theo Id hay không (đã bỏ qua xóa mềm).
     */
    boolean existsById(Integer id);

    /**
     * Đếm số lượng entity đang hoạt động.
     */
    long count();
}
