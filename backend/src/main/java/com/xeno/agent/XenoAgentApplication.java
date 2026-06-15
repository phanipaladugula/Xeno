package com.xeno.agent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Main application class for Xeno CRM
 */
@SpringBootApplication
@EnableAsync
public class XenoAgentApplication {

    public static void main(String[] args) {
        SpringApplication.run(XenoAgentApplication.class, args);
    }
}