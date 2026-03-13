-- Create SHEMS Database
CREATE DATABASE IF NOT EXISTS shems_db;
USE shems_db;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS devices;

-- Create Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile_number VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    primary_interest VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expiry TIMESTAMP NULL
);

-- Create Devices Table
CREATE TABLE devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    status VARCHAR(50),
    power_consumption DOUBLE,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Test Users (Passwords are plain text for testing - use proper hashing in production)
-- Test User 1
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, email_verified, verification_token) 
VALUES ('John', 'Doe', 'john@example.com', '9876543210', 'password123', 'Energy Monitoring', TRUE, NULL);

-- Test User 2
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, email_verified, verification_token) 
VALUES ('Jane', 'Smith', 'jane@example.com', '9876543211', 'password123', 'Cost Reduction', TRUE, NULL);

-- Test User 3
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, email_verified, verification_token) 
VALUES ('Bob', 'Johnson', 'bob@example.com', '9876543212', 'password123', 'Solar Integration', TRUE, NULL);

-- Insert Test Devices for User 1
INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location) 
VALUES (1, 'Living Room AC', 'Air Conditioner', 'ON', 1500, 'Living Room');

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location) 
VALUES (1, 'Kitchen Refrigerator', 'Refrigerator', 'ON', 400, 'Kitchen');

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location) 
VALUES (1, 'Master Bedroom Light', 'Light', 'OFF', 60, 'Master Bedroom');

-- Insert Test Devices for User 2
INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location) 
VALUES (2, 'Home Theater', 'Entertainment', 'OFF', 500, 'Living Room');

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location) 
VALUES (2, 'Water Heater', 'Heating', 'ON', 2000, 'Bathroom');

-- Display the test credentials
SELECT 'TEST CREDENTIALS' as 'Credential Type', '-----------' as 'Value' UNION ALL
SELECT 'Email 1:', 'john@example.com' UNION ALL
SELECT 'Password 1:', 'password123' UNION ALL
SELECT '', '' UNION ALL
SELECT 'Email 2:', 'jane@example.com' UNION ALL
SELECT 'Password 2:', 'password123' UNION ALL
SELECT '', '' UNION ALL
SELECT 'Email 3:', 'bob@example.com' UNION ALL
SELECT 'Password 3:', 'password123';
