# Smart Home Energy Management System (SHEMS) - Backend

## Project Overview
This is the Spring Boot backend for the SHEMS application, providing RESTful APIs for managing smart home devices.

## Prerequisites
- Java 17 or higher
- Apache Maven 3.6+
- MySQL 8.0+
- Git

## Project Structure
```
backend/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/shems/
│   │   │   ├── ShemsApplication.java (Main Spring Boot Application)
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java (CORS Configuration)
│   │   │   ├── controller/
│   │   │   │   └── DeviceController.java (REST API Endpoints)
│   │   │   ├── entity/
│   │   │   │   └── Device.java (Database Entity)
│   │   │   ├── repository/
│   │   │   │   └── DeviceRepository.java (JPA Repository)
│   │   │   └── service/
│   │   │       └── DeviceService.java (Business Logic)
│   │   └── resources/
│   │       └── application.properties (Configuration)
│   └── test/
└── README.md
```

## Setup Instructions

### Step 1: Database Setup
Create a MySQL database and user for SHEMS:

```sql
CREATE DATABASE shems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'shems_user'@'localhost' IDENTIFIED BY 'shems_password';
GRANT ALL PRIVILEGES ON shems_db.* TO 'shems_user'@'localhost';
FLUSH PRIVILEGES;
```

Or use the default credentials in `application.properties`:
- Database: `shems_db`
- Username: `root`
- Password: `root`

### Step 2: Configure Database Connection
Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/shems_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

### Step 3: Build the Backend
Navigate to the backend folder and run:

```bash
cd backend
mvn clean install
```

### Step 4: Run the Backend
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080/api`

## API Endpoints

### Device Management
- **GET** `/api/devices` - Get all devices
- **GET** `/api/devices/{id}` - Get device by ID
- **POST** `/api/devices` - Create device
- **PUT** `/api/devices/{id}` - Update device
- **DELETE** `/api/devices/{id}` - Delete device

### Device Search & Filtering
- **GET** `/api/devices/search?name={deviceName}` - Search devices by name
- **GET** `/api/devices/status/{status}` - Get devices by status (online/offline)
- **GET** `/api/devices/online` - Get all online devices
- **PUT** `/api/devices/{id}/toggle-status` - Toggle device online/offline status

### Health Check
- **GET** `/api/devices/health` - Check backend health

## Example API Requests

### Create a Device
```bash
curl -X POST http://localhost:8080/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Living Room Light",
    "type": "Smart Light",
    "icon": "💡",
    "status": "online",
    "powerUsage": "45W",
    "temperature": "25°C",
    "online": true
  }'
```

### Get All Devices
```bash
curl http://localhost:8080/api/devices
```

### Update a Device
```bash
curl -X PUT http://localhost:8080/api/devices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Living Room Light",
    "type": "Smart Light",
    "icon": "💡",
    "status": "online",
    "powerUsage": "50W",
    "temperature": "26°C",
    "online": true
  }'
```

### Delete a Device
```bash
curl -X DELETE http://localhost:8080/api/devices/1
```

## Frontend Integration

### Update Frontend API Base URL
In your frontend JavaScript files, update the API endpoint to point to the backend:

```javascript
// src/js/api.js (or wherever your API calls are)
const API_BASE_URL = 'http://localhost:8080/api';

// Example: Fetch all devices
async function getAllDevices() {
    const response = await fetch(`${API_BASE_URL}/devices`);
    return await response.json();
}

// Example: Add a device
async function addDevice(deviceData) {
    const response = await fetch(`${API_BASE_URL}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
    });
    return await response.json();
}
```

### Frontend to Backend Communication
The CORS configuration allows requests from:
- `http://localhost:5500` (Live Server)
- `http://localhost:8000` (Python HTTP Server)
- `http://127.0.0.1:5500`
- `http://127.0.0.1:8000`

To add more origins, edit `src/main/java/com/shems/config/CorsConfig.java`

## Database Schema

### Devices Table
```sql
CREATE TABLE devices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  status VARCHAR(50) NOT NULL,
  power_usage VARCHAR(50),
  temperature VARCHAR(50),
  online BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Running Frontend and Backend Together

### Terminal 1: Run Backend
```bash
cd backend
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

### Terminal 2: Run Frontend
```bash
cd .. (go to root task folder)
python -m http.server 8000
# or
# Live Server on http://localhost:5500
```

Then open your frontend on the browser and it will communicate with the backend.

## Troubleshooting

### MySQL Connection Issues
1. Ensure MySQL service is running
2. Check credentials in `application.properties`
3. Verify database `shems_db` exists

### CORS Errors
Add your frontend URL to `CorsConfig.java` allowedOrigins

### Port Already in Use
Change server port in `application.properties`:
```properties
server.port=8081
```

### Maven Build Failures
```bash
mvn clean install -DskipTests
```

## Technologies Used
- Spring Boot 3.1.5
- Spring Data JPA
- MySQL 8.0
- Lombok
- Maven

## Development
For local development with hot reload:
```bash
mvn spring-boot:run
```

DevTools is configured for automatic restart on file changes.

## Future Enhancements
- User authentication (JWT)
- Energy analytics endpoints
- Device notifications
- Scheduling features
- Real-time WebSocket updates

## License
This project is part of the Smart Home Energy Management System.
