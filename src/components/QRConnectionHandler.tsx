import { useEffect, useState } from 'react';
import { parseQRConnection, storeBackendConnection, clearQRConnection } from '@/utils/qrConnection';
import { toast } from '@/hooks/use-toast';

const QRConnectionHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleQRConnection = () => {
      const connectionData = parseQRConnection();
      
      if (connectionData) {
        setIsProcessing(true);
        
        // Store the backend URL and fetch connection info
        storeBackendConnection(connectionData.backend).then(() => {
          // Show success message
          toast({
            title: "QR Connection Successful!",
            description: `Connected to backend API: ${connectionData.backend}`,
            duration: 5000,
          });
          
          // Clear URL parameters after a delay
          setTimeout(() => {
            clearQRConnection();
            setIsProcessing(false);
          }, 3000);
        }).catch((error) => {
          console.error('QR Connection failed:', error);
          toast({
            title: "QR Connection Warning",
            description: `Connected to backend but could not fetch full connection info: ${connectionData.backend}`,
            variant: "destructive",
            duration: 5000,
          });
          setIsProcessing(false);
        });
      }
    };

    // Check for QR connection on component mount
    handleQRConnection();
  }, []);

  // Don't render anything visible
  return null;
};

export default QRConnectionHandler;
