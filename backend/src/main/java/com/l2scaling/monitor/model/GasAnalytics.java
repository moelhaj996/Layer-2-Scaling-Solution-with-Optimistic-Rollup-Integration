package com.l2scaling.monitor.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Gas Analytics Entity
 */
@Entity
@Table(name = "gas_analytics", indexes = {
    @Index(name = "idx_gas_operation_type", columnList = "operationType"),
    @Index(name = "idx_gas_timestamp", columnList = "timestamp")
})
@Data
public class GasAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String operationType; // ERC20_TRANSFER, BRIDGE_DEPOSIT, etc.

    @Column(nullable = false, length = 78)
    private String l1GasCostWei;

    @Column(nullable = false, length = 78)
    private String l2GasCostWei;

    @Column(nullable = false, precision = 20, scale = 10)
    private BigDecimal l1GasCostEth;

    @Column(nullable = false, precision = 20, scale = 10)
    private BigDecimal l2GasCostEth;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal savingsPercentage;

    @Column(nullable = false)
    private Instant timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
