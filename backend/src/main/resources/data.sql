-- Insert Test Users
INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, created_at, updated_at, email_verified, verification_otp)
VALUES ('John', 'Doe', 'john@example.com', '9876543210', 'password123', 'Energy Monitoring', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, NULL);

INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, created_at, updated_at, email_verified, verification_otp)
VALUES ('Jane', 'Smith', 'jane@example.com', '9876543211', 'password123', 'Cost Reduction', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, NULL);

INSERT INTO users (first_name, last_name, email, mobile_number, password, primary_interest, created_at, updated_at, email_verified, verification_otp)
VALUES ('Bob', 'Johnson', 'bob@example.com', '9876543212', 'password123', 'Solar Integration', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, NULL);

-- Insert Test Devices
INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Air Conditioner', 'HVAC', 'ON', 2.5, 'Living Room', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Water Heater', 'Appliance', 'ON', 4.5, 'Bathroom', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Smart Light', 'Lighting', 'ON', 0.15, 'Bedroom', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Refrigerator', 'Kitchen', 'ON', 0.8, 'Kitchen', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Washing Machine', 'Appliance', 'OFF', 2.0, 'Laundry Room', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Solar Panel', 'Solar', 'ON', -1.5, 'Roof', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Television', 'Entertainment', 'OFF', 0.3, 'Living Room', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Microwave', 'Kitchen', 'OFF', 1.2, 'Kitchen', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Dishwasher', 'Appliance', 'OFF', 1.8, 'Kitchen', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Ceiling Fan', 'HVAC', 'ON', 0.1, 'Bedroom', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (1, 'Laptop', 'Computer', 'ON', 0.05, 'Office', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (2, 'Air Conditioner', 'HVAC', 'ON', 2.8, 'Living Room', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (2, 'Refrigerator', 'Kitchen', 'ON', 0.9, 'Kitchen', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (2, 'Smart TV', 'Entertainment', 'ON', 0.25, 'Living Room', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (3, 'Water Heater', 'Appliance', 'ON', 4.0, 'Bathroom', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO devices (user_id, device_name, device_type, status, power_consumption, location, online, created_at, updated_at)
VALUES (3, 'LED Lights', 'Lighting', 'ON', 0.2, 'Living Room', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Sample Usage Data for the last 30 days
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(1, DATE '2026-02-08', 5.2),
(1, DATE '2026-02-09', 4.8),
(1, DATE '2026-02-10', 6.1),
(1, DATE '2026-02-11', 5.5),
(1, DATE '2026-02-12', 4.9),
(1, DATE '2026-02-13', 5.7),
(1, DATE '2026-02-14', 6.3),
(1, DATE '2026-02-15', 5.8),
(1, DATE '2026-02-16', 4.6),
(1, DATE '2026-02-17', 5.4),
(1, DATE '2026-02-18', 6.0),
(1, DATE '2026-02-19', 5.9),
(1, DATE '2026-02-20', 4.7),
(1, DATE '2026-02-21', 5.3),
(1, DATE '2026-02-22', 6.2),
(1, DATE '2026-02-23', 5.6),
(1, DATE '2026-02-24', 4.5),
(1, DATE '2026-02-25', 5.1),
(1, DATE '2026-02-26', 6.4),
(1, DATE '2026-02-27', 5.7),
(1, DATE '2026-02-28', 4.8),
(1, DATE '2026-03-01', 5.5),
(1, DATE '2026-03-02', 6.1),
(1, DATE '2026-03-03', 5.9),
(1, DATE '2026-03-04', 4.6),
(1, DATE '2026-03-05', 5.2),
(1, DATE '2026-03-06', 6.0),
(1, DATE '2026-03-07', 5.8),
(1, DATE '2026-03-08', 4.9),
(1, DATE '2026-03-09', 5.4);

-- Usage data for Television (device_id 7)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(7, DATE '2026-02-08', 2.1),
(7, DATE '2026-02-09', 1.8),
(7, DATE '2026-02-10', 2.5),
(7, DATE '2026-02-11', 2.2),
(7, DATE '2026-02-12', 1.9),
(7, DATE '2026-02-13', 2.3),
(7, DATE '2026-02-14', 2.7),
(7, DATE '2026-02-15', 2.4),
(7, DATE '2026-02-16', 1.6),
(7, DATE '2026-02-17', 2.0),
(7, DATE '2026-02-18', 2.6),
(7, DATE '2026-02-19', 2.5),
(7, DATE '2026-02-20', 1.7),
(7, DATE '2026-02-21', 1.9),
(7, DATE '2026-02-22', 2.8),
(7, DATE '2026-02-23', 2.2),
(7, DATE '2026-02-24', 1.5),
(7, DATE '2026-02-25', 1.8),
(7, DATE '2026-02-26', 2.9),
(7, DATE '2026-02-27', 2.3),
(7, DATE '2026-02-28', 1.8),
(7, DATE '2026-03-01', 2.2),
(7, DATE '2026-03-02', 2.6),
(7, DATE '2026-03-03', 2.5),
(7, DATE '2026-03-04', 1.6),
(7, DATE '2026-03-05', 2.1),
(7, DATE '2026-03-06', 2.4),
(7, DATE '2026-03-07', 2.3),
(7, DATE '2026-03-08', 1.9),
(7, DATE '2026-03-09', 2.0);

-- Usage data for Microwave (device_id 8)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(8, DATE '2026-02-08', 0.8),
(8, DATE '2026-02-09', 0.6),
(8, DATE '2026-02-10', 1.0),
(8, DATE '2026-02-11', 0.7),
(8, DATE '2026-02-12', 0.5),
(8, DATE '2026-02-13', 0.9),
(8, DATE '2026-02-14', 1.1),
(8, DATE '2026-02-15', 0.8),
(8, DATE '2026-02-16', 0.4),
(8, DATE '2026-02-17', 0.6),
(8, DATE '2026-02-18', 1.0),
(8, DATE '2026-02-19', 0.9),
(8, DATE '2026-02-20', 0.5),
(8, DATE '2026-02-21', 0.7),
(8, DATE '2026-02-22', 1.2),
(8, DATE '2026-02-23', 0.8),
(8, DATE '2026-02-24', 0.3),
(8, DATE '2026-02-25', 0.6),
(8, DATE '2026-02-26', 1.3),
(8, DATE '2026-02-27', 0.9),
(8, DATE '2026-02-28', 0.6),
(8, DATE '2026-03-01', 0.7),
(8, DATE '2026-03-02', 1.0),
(8, DATE '2026-03-03', 0.9),
(8, DATE '2026-03-04', 0.4),
(8, DATE '2026-03-05', 0.8),
(8, DATE '2026-03-06', 1.0),
(8, DATE '2026-03-07', 0.8),
(8, DATE '2026-03-08', 0.5),
(8, DATE '2026-03-09', 0.6);

-- Usage data for Dishwasher (device_id 9)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(9, DATE '2026-02-08', 1.5),
(9, DATE '2026-02-09', 0.0),
(9, DATE '2026-02-10', 1.8),
(9, DATE '2026-02-11', 0.0),
(9, DATE '2026-02-12', 1.2),
(9, DATE '2026-02-13', 0.0),
(9, DATE '2026-02-14', 1.9),
(9, DATE '2026-02-15', 0.0),
(9, DATE '2026-02-16', 1.1),
(9, DATE '2026-02-17', 0.0),
(9, DATE '2026-02-18', 1.6),
(9, DATE '2026-02-19', 0.0),
(9, DATE '2026-02-20', 1.3),
(9, DATE '2026-02-21', 0.0),
(9, DATE '2026-02-22', 2.0),
(9, DATE '2026-02-23', 0.0),
(9, DATE '2026-02-24', 1.0),
(9, DATE '2026-02-25', 0.0),
(9, DATE '2026-02-26', 1.7),
(9, DATE '2026-02-27', 0.0),
(9, DATE '2026-02-28', 1.4),
(9, DATE '2026-03-01', 0.0),
(9, DATE '2026-03-02', 1.8),
(9, DATE '2026-03-03', 0.0),
(9, DATE '2026-03-04', 1.2),
(9, DATE '2026-03-05', 0.0),
(9, DATE '2026-03-06', 1.6),
(9, DATE '2026-03-07', 0.0),
(9, DATE '2026-03-08', 1.1),
(9, DATE '2026-03-09', 0.0);

-- Usage data for Ceiling Fan (device_id 10)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(10, DATE '2026-02-08', 0.8),
(10, DATE '2026-02-09', 0.6),
(10, DATE '2026-02-10', 1.0),
(10, DATE '2026-02-11', 0.7),
(10, DATE '2026-02-12', 0.5),
(10, DATE '2026-02-13', 0.9),
(10, DATE '2026-02-14', 1.1),
(10, DATE '2026-02-15', 0.8),
(10, DATE '2026-02-16', 0.4),
(10, DATE '2026-02-17', 0.6),
(10, DATE '2026-02-18', 1.0),
(10, DATE '2026-02-19', 0.9),
(10, DATE '2026-02-20', 0.5),
(10, DATE '2026-02-21', 0.7),
(10, DATE '2026-02-22', 1.2),
(10, DATE '2026-02-23', 0.8),
(10, DATE '2026-02-24', 0.3),
(10, DATE '2026-02-25', 0.6),
(10, DATE '2026-02-26', 1.3),
(10, DATE '2026-02-27', 0.9),
(10, DATE '2026-02-28', 0.6),
(10, DATE '2026-03-01', 0.7),
(10, DATE '2026-03-02', 1.0),
(10, DATE '2026-03-03', 0.9),
(10, DATE '2026-03-04', 0.4),
(10, DATE '2026-03-05', 0.8),
(10, DATE '2026-03-06', 1.0),
(10, DATE '2026-03-07', 0.8),
(10, DATE '2026-03-08', 0.5),
(10, DATE '2026-03-09', 0.6);

-- Usage data for Laptop (device_id 11)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(11, DATE '2026-02-08', 0.3),
(11, DATE '2026-02-09', 0.25),
(11, DATE '2026-02-10', 0.4),
(11, DATE '2026-02-11', 0.35),
(11, DATE '2026-02-12', 0.2),
(11, DATE '2026-02-13', 0.38),
(11, DATE '2026-02-14', 0.42),
(11, DATE '2026-02-15', 0.3),
(11, DATE '2026-02-16', 0.15),
(11, DATE '2026-02-17', 0.28),
(11, DATE '2026-02-18', 0.4),
(11, DATE '2026-02-19', 0.37),
(11, DATE '2026-02-20', 0.22),
(11, DATE '2026-02-21', 0.31),
(11, DATE '2026-02-22', 0.45),
(11, DATE '2026-02-23', 0.33),
(11, DATE '2026-02-24', 0.18),
(11, DATE '2026-02-25', 0.26),
(11, DATE '2026-02-26', 0.48),
(11, DATE '2026-02-27', 0.36),
(11, DATE '2026-02-28', 0.24),
(11, DATE '2026-03-01', 0.29),
(11, DATE '2026-03-02', 0.41),
(11, DATE '2026-03-03', 0.38),
(11, DATE '2026-03-04', 0.19),
(11, DATE '2026-03-05', 0.32),
(11, DATE '2026-03-06', 0.39),
(11, DATE '2026-03-07', 0.34),
(11, DATE '2026-03-08', 0.21),
(11, DATE '2026-03-09', 0.27);

-- Usage data for User 2's Air Conditioner (device_id 12)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(12, DATE '2026-02-08', 6.5),
(12, DATE '2026-02-09', 5.8),
(12, DATE '2026-02-10', 7.2),
(12, DATE '2026-02-11', 6.8),
(12, DATE '2026-02-12', 5.9),
(12, DATE '2026-02-13', 6.7),
(12, DATE '2026-02-14', 7.5),
(12, DATE '2026-02-15', 6.9),
(12, DATE '2026-02-16', 5.6),
(12, DATE '2026-02-17', 6.3),
(12, DATE '2026-02-18', 7.1),
(12, DATE '2026-02-19', 7.0),
(12, DATE '2026-02-20', 5.7),
(12, DATE '2026-02-21', 6.2),
(12, DATE '2026-02-22', 7.3),
(12, DATE '2026-02-23', 6.6),
(12, DATE '2026-02-24', 5.4),
(12, DATE '2026-02-25', 6.0),
(12, DATE '2026-02-26', 7.6),
(12, DATE '2026-02-27', 6.7),
(12, DATE '2026-02-28', 5.8),
(12, DATE '2026-03-01', 6.5),
(12, DATE '2026-03-02', 7.2),
(12, DATE '2026-03-03', 7.0),
(12, DATE '2026-03-04', 5.6),
(12, DATE '2026-03-05', 6.1),
(12, DATE '2026-03-06', 7.0),
(12, DATE '2026-03-07', 6.8),
(12, DATE '2026-03-08', 5.9),
(12, DATE '2026-03-09', 6.3);

-- Usage data for User 2's Refrigerator (device_id 13)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(13, DATE '2026-02-08', 1.2),
(13, DATE '2026-02-09', 1.1),
(13, DATE '2026-02-10', 1.3),
(13, DATE '2026-02-11', 1.2),
(13, DATE '2026-02-12', 1.0),
(13, DATE '2026-02-13', 1.2),
(13, DATE '2026-02-14', 1.4),
(13, DATE '2026-02-15', 1.3),
(13, DATE '2026-02-16', 0.9),
(13, DATE '2026-02-17', 1.1),
(13, DATE '2026-02-18', 1.3),
(13, DATE '2026-02-19', 1.3),
(13, DATE '2026-02-20', 1.0),
(13, DATE '2026-02-21', 1.2),
(13, DATE '2026-02-22', 1.4),
(13, DATE '2026-02-23', 1.2),
(13, DATE '2026-02-24', 0.8),
(13, DATE '2026-02-25', 1.0),
(13, DATE '2026-02-26', 1.5),
(13, DATE '2026-02-27', 1.3),
(13, DATE '2026-02-28', 1.1),
(13, DATE '2026-03-01', 1.2),
(13, DATE '2026-03-02', 1.3),
(13, DATE '2026-03-03', 1.3),
(13, DATE '2026-03-04', 0.9),
(13, DATE '2026-03-05', 1.1),
(13, DATE '2026-03-06', 1.3),
(13, DATE '2026-03-07', 1.2),
(13, DATE '2026-03-08', 1.0),
(13, DATE '2026-03-09', 1.1);

-- Usage data for User 2's Smart TV (device_id 14)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(14, DATE '2026-02-08', 1.8),
(14, DATE '2026-02-09', 1.5),
(14, DATE '2026-02-10', 2.2),
(14, DATE '2026-02-11', 1.9),
(14, DATE '2026-02-12', 1.6),
(14, DATE '2026-02-13', 2.0),
(14, DATE '2026-02-14', 2.4),
(14, DATE '2026-02-15', 2.1),
(14, DATE '2026-02-16', 1.3),
(14, DATE '2026-02-17', 1.7),
(14, DATE '2026-02-18', 2.3),
(14, DATE '2026-02-19', 2.2),
(14, DATE '2026-02-20', 1.4),
(14, DATE '2026-02-21', 1.6),
(14, DATE '2026-02-22', 2.5),
(14, DATE '2026-02-23', 1.9),
(14, DATE '2026-02-24', 1.2),
(14, DATE '2026-02-25', 1.5),
(14, DATE '2026-02-26', 2.6),
(14, DATE '2026-02-27', 2.0),
(14, DATE '2026-02-28', 1.5),
(14, DATE '2026-03-01', 1.8),
(14, DATE '2026-03-02', 2.3),
(14, DATE '2026-03-03', 2.2),
(14, DATE '2026-03-04', 1.3),
(14, DATE '2026-03-05', 1.7),
(14, DATE '2026-03-06', 2.1),
(14, DATE '2026-03-07', 1.9),
(14, DATE '2026-03-08', 1.6),
(14, DATE '2026-03-09', 1.7);

-- Usage data for User 3's Water Heater (device_id 15)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(15, DATE '2026-02-08', 8.5),
(15, DATE '2026-02-09', 7.8),
(15, DATE '2026-02-10', 9.2),
(15, DATE '2026-02-11', 8.8),
(15, DATE '2026-02-12', 7.9),
(15, DATE '2026-02-13', 8.7),
(15, DATE '2026-02-14', 9.5),
(15, DATE '2026-02-15', 8.9),
(15, DATE '2026-02-16', 7.6),
(15, DATE '2026-02-17', 8.3),
(15, DATE '2026-02-18', 9.1),
(15, DATE '2026-02-19', 9.0),
(15, DATE '2026-02-20', 7.7),
(15, DATE '2026-02-21', 8.2),
(15, DATE '2026-02-22', 9.3),
(15, DATE '2026-02-23', 8.6),
(15, DATE '2026-02-24', 7.4),
(15, DATE '2026-02-25', 8.0),
(15, DATE '2026-02-26', 9.6),
(15, DATE '2026-02-27', 8.7),
(15, DATE '2026-02-28', 7.8),
(15, DATE '2026-03-01', 8.5),
(15, DATE '2026-03-02', 9.2),
(15, DATE '2026-03-03', 9.0),
(15, DATE '2026-03-04', 7.6),
(15, DATE '2026-03-05', 8.1),
(15, DATE '2026-03-06', 9.0),
(15, DATE '2026-03-07', 8.8),
(15, DATE '2026-03-08', 7.9),
(15, DATE '2026-03-09', 8.3);

-- Usage data for User 3's LED Lights (device_id 16)
INSERT INTO usage (device_id, usage_date, daily_consumption) VALUES
(16, DATE '2026-02-08', 0.6),
(16, DATE '2026-02-09', 0.5),
(16, DATE '2026-02-10', 0.7),
(16, DATE '2026-02-11', 0.6),
(16, DATE '2026-02-12', 0.4),
(16, DATE '2026-02-13', 0.6),
(16, DATE '2026-02-14', 0.8),
(16, DATE '2026-02-15', 0.7),
(16, DATE '2026-02-16', 0.3),
(16, DATE '2026-02-17', 0.5),
(16, DATE '2026-02-18', 0.7),
(16, DATE '2026-02-19', 0.7),
(16, DATE '2026-02-20', 0.4),
(16, DATE '2026-02-21', 0.6),
(16, DATE '2026-02-22', 0.8),
(16, DATE '2026-02-23', 0.6),
(16, DATE '2026-02-24', 0.2),
(16, DATE '2026-02-25', 0.4),
(16, DATE '2026-02-26', 0.9),
(16, DATE '2026-02-27', 0.7),
(16, DATE '2026-02-28', 0.5),
(16, DATE '2026-03-01', 0.6),
(16, DATE '2026-03-02', 0.7),
(16, DATE '2026-03-03', 0.7),
(16, DATE '2026-03-04', 0.3),
(16, DATE '2026-03-05', 0.5),
(16, DATE '2026-03-06', 0.7),
(16, DATE '2026-03-07', 0.6),
(16, DATE '2026-03-08', 0.4),
(16, DATE '2026-03-09', 0.5);

