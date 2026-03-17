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
    profile_photo LONGTEXT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    date_of_birth VARCHAR(50),
    occupation VARCHAR(100),
    bio LONGTEXT,
    password VARCHAR(255) NOT NULL,
    primary_interest VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_otp VARCHAR(255),
    verification_otp_expiry TIMESTAMP NULL,
    notify_energy_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    notify_email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    notify_weekly_reports BOOLEAN NOT NULL DEFAULT TRUE,
    notify_peak_alerts BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_target_kwh INT,
    last_energy_alert_at TIMESTAMP NULL,
    last_peak_alert_at TIMESTAMP NULL,
    last_weekly_report_at TIMESTAMP NULL,
    last_monthly_target_alert_at TIMESTAMP NULL,
    welcome_email_sent_at TIMESTAMP NULL
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

-- Create Rooms Table
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    room_name VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rooms_user_name (user_id, room_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Test Users (Passwords are plain text for testing - use proper hashing in production)
-- Test User 1
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, email_verified, verification_otp) 
VALUES ('John', 'Doe', 'john@example.com', '9876543210', 'password123', 'Energy Monitoring', TRUE, NULL);

-- Test User 2
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, email_verified, verification_otp) 
VALUES ('Jane', 'Smith', 'jane@example.com', '9876543211', 'password123', 'Cost Reduction', TRUE, NULL);

-- Test User 3
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, email_verified, verification_otp) 
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
