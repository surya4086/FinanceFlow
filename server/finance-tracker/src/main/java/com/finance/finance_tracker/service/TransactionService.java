
package com.finance.finance_tracker.service;

import com.finance.finance_tracker.entity.Transaction;
import com.finance.finance_tracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction addTransaction(Transaction transaction, String userId) {

        transaction.setId(null);
        transaction.setUserId(userId);
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactions(String userId) {
        return transactionRepository
                .findByUserIdOrderByDateDesc(userId);
    }

    public void deleteTransaction(String id, String userId) {

        Transaction transaction = transactionRepository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found"));

        transactionRepository.delete(transaction);
    }
}
