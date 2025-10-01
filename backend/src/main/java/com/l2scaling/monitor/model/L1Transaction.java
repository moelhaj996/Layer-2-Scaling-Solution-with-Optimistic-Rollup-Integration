package com.l2scaling.monitor.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigInteger;
import java.time.Instant;

/**
 * L1 Transaction Entity
 */
@Entity
@Table(name = "l1_transactions", indexes = {
    @Index(name = "idx_l1_tx_hash", columnList = "transactionHash"),
    @Index(name = "idx_l1_from_address", columnList = "fromAddress"),
    @Index(name = "idx_l1_timestamp", columnList = "timestamp")
})
@Data
public class L1Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 66)
    private String transactionHash;

    @Column(nullable = false, length = 42)
    private String fromAddress;

    @Column(nullable = false, length = 42)
    private String toAddress;

    @Column(nullable = false)
    private String amount; // Store as String for BigInteger

    private Long depositId;

    @Column(nullable = false)
    private Long blockNumber;

    @Column(nullable = false, length = 20)
    private String eventType; // DEPOSIT, WITHDRAWAL

    private Long gasUsed;

    private String gasPrice; // Store as String for BigInteger

    @Column(nullable = false)
    private Instant timestamp;

    @Column(length = 20)
    private String status = "CONFIRMED";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
