/**
 * SHEMS API Client
 * This file should be placed in your frontend project to handle API calls
 * Path: frontend/js/api-client.js
 */

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    TIMEOUT: 5000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

/**
 * Device API Class
 */
class DeviceAPI {
    /**
     * Get all devices from backend
     * @returns {Promise<Array>}
     */
    static async getAllDevices() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices`, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to fetch devices');
            return await response.json();
        } catch (error) {
            console.error('Error fetching devices:', error);
            return [];
        }
    }

    /**
     * Get device by ID
     * @param {number} id - Device ID
     * @returns {Promise<Object>}
     */
    static async getDeviceById(id) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/${id}`, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to fetch device');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching device ${id}:`, error);
            return null;
        }
    }

    /**
     * Create a new device
     * @param {Object} deviceData - Device data
     * @returns {Promise<Object>}
     */
    static async createDevice(deviceData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(deviceData)
            });
            if (!response.ok) throw new Error('Failed to create device');
            return await response.json();
        } catch (error) {
            console.error('Error creating device:', error);
            return null;
        }
    }

    /**
     * Update device
     * @param {number} id - Device ID
     * @param {Object} deviceData - Updated device data
     * @returns {Promise<Object>}
     */
    static async updateDevice(id, deviceData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/${id}`, {
                method: 'PUT',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(deviceData)
            });
            if (!response.ok) throw new Error('Failed to update device');
            return await response.json();
        } catch (error) {
            console.error(`Error updating device ${id}:`, error);
            return null;
        }
    }

    /**
     * Delete device
     * @param {number} id - Device ID
     * @returns {Promise<boolean>}
     */
    static async deleteDevice(id) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/${id}`, {
                method: 'DELETE',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to delete device');
            return true;
        } catch (error) {
            console.error(`Error deleting device ${id}:`, error);
            return false;
        }
    }

    /**
     * Search devices by name
     * @param {string} name - Device name to search
     * @returns {Promise<Array>}
     */
    static async searchDevices(name) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/search?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to search devices');
            return await response.json();
        } catch (error) {
            console.error('Error searching devices:', error);
            return [];
        }
    }

    /**
     * Get devices by status
     * @param {string} status - Device status (online/offline)
     * @returns {Promise<Array>}
     */
    static async getDevicesByStatus(status) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/status/${status}`, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to fetch devices by status');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${status} devices:`, error);
            return [];
        }
    }

    /**
     * Get all online devices
     * @returns {Promise<Array>}
     */
    static async getOnlineDevices() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/online`, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to fetch online devices');
            return await response.json();
        } catch (error) {
            console.error('Error fetching online devices:', error);
            return [];
        }
    }

    /**
     * Toggle device online/offline status
     * @param {number} id - Device ID
     * @returns {Promise<Object>}
     */
    static async toggleDeviceStatus(id) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/${id}/toggle-status`, {
                method: 'PUT',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Failed to toggle device status');
            return await response.json();
        } catch (error) {
            console.error(`Error toggling device ${id} status:`, error);
            return null;
        }
    }

    /**
     * Check backend health
     * @returns {Promise<Object>}
     */
    static async checkHealth() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/devices/health`, {
                method: 'GET',
                headers: API_CONFIG.HEADERS
            });
            if (!response.ok) throw new Error('Backend not healthy');
            return await response.json();
        } catch (error) {
            console.error('Backend health check failed:', error);
            return { status: 'offline', database: 'disconnected' };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceAPI;
}
