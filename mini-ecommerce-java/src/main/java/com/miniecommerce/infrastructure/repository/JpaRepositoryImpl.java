package com.miniecommerce.infrastructure.repository;

import com.miniecommerce.domain.entity.BaseEntity;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Triển khai generic Repository dựa trên JPA EntityManager.
 * Chứa logic truy xuất dữ liệu cơ bản và Soft Delete.
 */
public class JpaRepositoryImpl<T extends BaseEntity> implements IRepository<T> {

    private final Class<T> entityClass;
    private final EntityManager entityManager;

    public JpaRepositoryImpl(Class<T> entityClass, EntityManager entityManager) {
        this.entityClass = entityClass;
        this.entityManager = entityManager;
    }

    @Override
    public Optional<T> findById(Integer id) {
        T entity = entityManager.find(entityClass, id);
        return Optional.ofNullable(entity).filter(e -> !e.isDeleted());
    }

    @Override
    public List<T> findAll() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<T> query = cb.createQuery(entityClass);
        Root<T> root = query.from(entityClass);
        // Soft Delete: chỉ lấy những bản ghi chưa bị xóa
        query.where(cb.equal(root.get("isDeleted"), false));
        return entityManager.createQuery(query).getResultList();
    }

    @Override
    public T save(T entity) {
        if (entity.getId() == null) {
            entityManager.persist(entity);
            return entity;
        } else {
            return entityManager.merge(entity);
        }
    }

    @Override
    public void delete(T entity) {
        entityManager.remove(entity);
    }

    @Override
    public void softDelete(Integer id) {
        T entity = entityManager.find(entityClass, id);
        if (entity != null) {
            entity.setDeleted(true);
            entity.setDeletedAt(LocalDateTime.now());
            entityManager.merge(entity);
        }
    }

    @Override
    public boolean existsById(Integer id) {
        return findById(id).isPresent();
    }

    @Override
    public long count() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = cb.createQuery(Long.class);
        Root<T> root = query.from(entityClass);
        query.select(cb.count(root)).where(cb.equal(root.get("isDeleted"), false));
        return entityManager.createQuery(query).getSingleResult();
    }
}
