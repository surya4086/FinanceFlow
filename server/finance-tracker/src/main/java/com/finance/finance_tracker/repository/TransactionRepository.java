
package com.finance.finance_tracker.repository;

import com.finance.finance_tracker.entity.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository
        extends MongoRepository<Transaction, String> {

    // Get all transactions belonging to a user
    List<Transaction> findByUserIdOrderByDateDesc(String userId);

    // Find a particular transaction owned by a user
    Optional<Transaction> findByIdAndUserId(String id, String userId);

    // Delete only if the transaction belongs to that user
    void deleteByIdAndUserId(String id, String userId);
}
