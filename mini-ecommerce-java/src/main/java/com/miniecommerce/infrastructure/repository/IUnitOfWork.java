package com.miniecommerce.infrastructure.repository;

import com.miniecommerce.domain.entity.BaseEntity;

/**
 * Unit of Work pattern: quản lý các Repository và kiểm soát Transaction
 * để đảm bảo tính nhất quán dữ liệu khi thực hiện nhiều thao tác liên quan.
 */
public interface IUnitOfWork {

    /**
     * Lấy Repository của entity T (được cache để tái sử dụng).
     */
    <T extends BaseEntity> IRepository<T> repository(Class<T> entityClass);

    /**
     * Bắt đầu một transaction mới.
     */
    void beginTransaction();

    /**
     * Lưu thay đổi và commit transaction.
     */
    void commit();

    /**
     * Rollback transaction nếu có lỗi.
     */
    void rollback();

    /**
     * Flush thay đổi vào DB (SaveChanges) mà không commit transaction.
     */
    int saveChanges();
}
