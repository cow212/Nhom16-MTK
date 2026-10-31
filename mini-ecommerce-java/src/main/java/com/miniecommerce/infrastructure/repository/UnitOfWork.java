package com.miniecommerce.infrastructure.repository;

import com.miniecommerce.domain.entity.BaseEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityTransaction;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Triển khai Unit of Work: quản lý EntityManager transaction và các Repository.
 */
@Component
public class UnitOfWork implements IUnitOfWork {

    private final EntityManager entityManager;
    private final Map<Class<?>, IRepository<?>> repositories = new HashMap<>();
    private EntityTransaction transaction;

    public UnitOfWork(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <T extends BaseEntity> IRepository<T> repository(Class<T> entityClass) {
        return (IRepository<T>) repositories.computeIfAbsent(entityClass,
                k -> new JpaRepositoryImpl<>(entityClass, entityManager));
    }

    @Override
    public void beginTransaction() {
        if (transaction == null || !transaction.isActive()) {
            transaction = entityManager.getTransaction();
            transaction.begin();
        }
    }

    @Override
    public void commit() {
        try {
            entityManager.flush();
            if (transaction != null && transaction.isActive()) {
                transaction.commit();
            }
        } catch (Exception e) {
            // Nếu commit thất bại, rollback về trạng thái an toàn rồi ném lại ngoại lệ
            rollback();
            throw e;
        } finally {
            transaction = null;
        }
    }

    @Override
    public void rollback() {
        if (transaction != null && transaction.isActive()) {
            transaction.rollback();
        }
        transaction = null;
    }

    @Override
    public int saveChanges() {
        entityManager.flush();
        return 0;
    }
}
