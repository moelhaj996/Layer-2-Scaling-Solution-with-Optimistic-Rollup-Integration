package com.l2scaling.monitor.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

/**
 * Web3j configuration for dual-chain connectivity
 */
@Configuration
@Slf4j
public class Web3jConfig {

    @Value("${ethereum.l1.rpc-url}")
    private String l1RpcUrl;

    @Value("${ethereum.l2.rpc-url}")
    private String l2RpcUrl;

    @Value("${relayer.private-key:}")
    private String privateKey;

    @Bean(name = "l1Web3j")
    public Web3j l1Web3j() {
        log.info("Connecting to L1 network: {}", l1RpcUrl);
        return Web3j.build(new HttpService(l1RpcUrl));
    }

    @Bean(name = "l2Web3j")
    public Web3j l2Web3j() {
        log.info("Connecting to L2 network: {}", l2RpcUrl);
        return Web3j.build(new HttpService(l2RpcUrl));
    }

    @Bean
    public Credentials credentials() {
        if (privateKey == null || privateKey.isEmpty()) {
            log.warn("No private key configured - relayer will not function");
            return null;
        }

        try {
            return Credentials.create(privateKey);
        } catch (Exception e) {
            log.error("Failed to create credentials from private key", e);
            return null;
        }
    }
}
