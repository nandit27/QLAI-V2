import axios from 'axios';

/**
 * Maintenance Service
 * 
 * This service provides methods to check and toggle maintenance mode.
 * NOTE: getStatus should only be called:
 * - Once on initial app load
 * - When user explicitly clicks "retry" button
 * 
 * The app relies on API interceptors (503 responses) for real-time
 * maintenance detection, NOT continuous polling.
 */
export const maintenanceService = {
  /**
   * Get current maintenance status
   * Called once on app load and on manual retry
   */
  getStatus: async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/maintenance/status`,
        { timeout: 5000 } // 5 second timeout
      );
      return response.data;
    } catch (error) {
      // If the request fails, check if it's a 503 (maintenance mode)
      if (error.response?.status === 503) {
        return {
          success: true,
          isMaintenanceMode: true,
          message: error.response.data?.message || 'The system is currently under maintenance.'
        };
      }
      
      console.error('Error fetching maintenance status:', error);
      // Return safe default - assume not in maintenance
      return {
        success: false,
        isMaintenanceMode: false,
        message: 'Error checking maintenance status'
      };
    }
  },

  /**
   * Toggle maintenance mode (admin only)
   */
  toggleMode: async (isMaintenanceMode, message) => {
    try {
      const userInfo = localStorage.getItem('user-info');
      if (!userInfo) {
        throw new Error('User not authenticated');
      }
      
      const { token } = JSON.parse(userInfo);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/maintenance/toggle`,
        {
          isMaintenanceMode,
          message
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to toggle maintenance mode'
      );
    }
  }
};
