package com.shems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShemsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShemsApplication.class, args);
    }
}
