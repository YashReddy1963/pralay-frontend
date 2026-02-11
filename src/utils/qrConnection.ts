/**
 * QR Connection Handler
 * Processes QR code connection parameters and provides backend API access
 */

export interface QRConnectionData {
  connect: boolean;
  backend: string;
}

export const parseQRConnection = (): QRConnectionData | null => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('connect') === 'true') {
    const backendUrl = urlParams.get('backend');
    
    if (backendUrl) {
      return {
        connect: true,
        backend: decodeURIComponent(backendUrl)
      };
    }
  }
  
  return null;
};

export const storeBackendConnection = async (backendUrl: string): Promise<void> => {
  // Store the backend URL for API calls
  localStorage.setItem('pralay_backend_url', backendUrl);
  
  try {
    // Fetch connection info from the backend
    const response = await fetch(`${backendUrl}/api/connection-info/`);
    if (response.ok) {
      const connectionInfo = await response.json();
      localStorage.setItem('pralay_connection_info', JSON.stringify(connectionInfo));
      console.log('QR Connection: Full connection info stored:', connectionInfo);
    }
  } catch (error) {
    console.warn('QR Connection: Could not fetch connection info:', error);
  }
  
  console.log('QR Connection: Backend URL stored:', backendUrl);
};

export const getStoredBackendURL = (): string | null => {
  return localStorage.getItem('pralay_backend_url');
};

export const clearQRConnection = (): void => {
  // Remove connection parameters from URL
  const url = new URL(window.location.href);
  url.searchParams.delete('connect');
  url.searchParams.delete('backend');
  
  // Update URL without reloading
  window.history.replaceState({}, '', url.toString());
};
