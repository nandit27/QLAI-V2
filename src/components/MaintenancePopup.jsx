import { useState, useEffect, useCallback } from 'react';
import MaintenancePage from './MaintenancePage';
import { maintenanceService } from '../services/maintenanceService';

/**
 * MaintenancePopup - Production-ready maintenance mode handler
 * 
 * This component:
 * 1. Checks maintenance status ONCE on initial load
 * 2. Listens for 503 responses from API interceptors (via custom event)
 * 3. Shows full-page blocking maintenance screen when in maintenance mode
 * 4. Does NOT poll continuously - relies on API responses
 */
const MaintenancePopup = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasCheckedInitially, setHasCheckedInitially] = useState(false);

  // Check maintenance status (used on initial load and retry)
  const checkMaintenanceStatus = useCallback(async () => {
    try {
      setIsRetrying(true);
      const data = await maintenanceService.getStatus();
      
      if (data.success) {
        setIsMaintenanceMode(data.isMaintenanceMode);
        setMaintenanceMessage(data.message || '');
        
        // Clear localStorage if not in maintenance mode
        if (!data.isMaintenanceMode) {
          localStorage.removeItem('maintenance-mode');
        }
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      // On error, assume not in maintenance (let API calls handle it)
      setIsMaintenanceMode(false);
    } finally {
      setIsRetrying(false);
      setHasCheckedInitially(true);
    }
  }, []);

  // Handle retry button click
  const handleRetry = useCallback(async () => {
    await checkMaintenanceStatus();
  }, [checkMaintenanceStatus]);

  useEffect(() => {
    // Check maintenance status ONCE on component mount
    checkMaintenanceStatus();

    // Listen for maintenance mode events from API interceptors (503 responses)
    const handleMaintenanceEvent = (event) => {
      const { isMaintenanceMode: isMaintenance, message } = event.detail;
      if (isMaintenance) {
        setIsMaintenanceMode(true);
        setMaintenanceMessage(message || 'The system is currently under maintenance. Please try again later.');
      }
    };

    window.addEventListener('maintenance-mode', handleMaintenanceEvent);

    // Check localStorage for maintenance status (in case page was refreshed during maintenance)
    const storedMaintenance = localStorage.getItem('maintenance-mode');
    if (storedMaintenance) {
      try {
        const parsed = JSON.parse(storedMaintenance);
        // Only use stored status if it's recent (within last 5 minutes)
        const isRecent = Date.now() - parsed.timestamp < 5 * 60 * 1000;
        if (parsed.isMaintenanceMode && isRecent) {
          setIsMaintenanceMode(true);
          setMaintenanceMessage(parsed.message);
        } else {
          // Clear stale maintenance status
          localStorage.removeItem('maintenance-mode');
        }
      } catch (e) {
        console.error('Error parsing maintenance status:', e);
        localStorage.removeItem('maintenance-mode');
      }
    }

    return () => {
      window.removeEventListener('maintenance-mode', handleMaintenanceEvent);
    };
  }, [checkMaintenanceStatus]);

  // Don't render anything until initial check is complete
  if (!hasCheckedInitially) {
    return null;
  }

  // Show full-page maintenance screen if in maintenance mode
  if (isMaintenanceMode) {
    return (
      <MaintenancePage
        message={maintenanceMessage}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  // Not in maintenance mode - render nothing
  return null;
};

export default MaintenancePopup;
