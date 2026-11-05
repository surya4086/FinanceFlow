
package com.finance.finance_tracker.controller;

import com.finance.finance_tracker.entity.Transaction;
import com.finance.finance_tracker.service.TransactionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // ADD TRANSACTION
    @PostMapping
    public ResponseEntity<Transaction> addTransaction(
            @Valid @RequestBody Transaction transaction,
            Authentication authentication) {

        String userId = authentication.getName();

        Transaction saved = transactionService
                .addTransaction(transaction, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // GET ALL USER TRANSACTIONS
    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            Authentication authentication) {

        String userId = authentication.getName();

        List<Transaction> transactions =
                transactionService.getTransactions(userId);

        return ResponseEntity.ok(transactions);
    }

    // DELETE TRANSACTION
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable String id,
            Authentication authentication) {

        String userId = authentication.getName();

        transactionService.deleteTransaction(id, userId);

        return ResponseEntity.noContent().build();
    }
}
