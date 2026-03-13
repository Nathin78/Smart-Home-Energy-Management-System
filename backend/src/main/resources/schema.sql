-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    primary_interest VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_otp VARCHAR(255),
    verification_otp_expiry TIMESTAMP NULL
);

-- Create Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    power_consumption DOUBLE,
    location VARCHAR(255),
    online BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Usage Table
CREATE TABLE IF NOT EXISTS usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id BIGINT NOT NULL,
    usage_date DATE NOT NULL,
    daily_consumption DOUBLE NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
);
