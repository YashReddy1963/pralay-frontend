import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  phoneNumber: string;
  formData?: {
    fullName: string;
    email: string;
    phoneNumber: string;
    location: string;
    password: string;
    confirmPassword: string;
  };
}

const OTPVerificationModal = ({ isOpen, onClose, email, phoneNumber, formData }: OTPVerificationModalProps) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setTimeLeft(300);
      setVerificationStatus('idle');
      setErrorMessage("");
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setErrorMessage("");
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');

    try {
      // Verify OTP with backend
      await apiService.verifyOTP(email, otp);
      
      // If OTP is verified, register the user
      if (formData) {
        const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        // Parse location to extract state and district if possible
        const locationParts = formData.location.split(',').map(part => part.trim());
        const state = locationParts.length > 1 ? locationParts[1] : '';
        const district = locationParts.length > 0 ? locationParts[0] : '';
        
        const registerData = {
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          password: formData.password,
          state: state,
          district: district,
          address: formData.location
        };
        
        await apiService.register(registerData);
        toast.success("Account created successfully!");
      }
      
      setVerificationStatus('success');
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.message || "Invalid OTP. Please try again.");
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setTimeLeft(300);
    setOtp("");
    setErrorMessage("");
    setVerificationStatus('idle');
    
    try {
      await apiService.sendOTP(email);
      toast.success("OTP sent again to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
      console.error("Resend OTP error:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerifyOTP();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-12 w-12 text-primary-glow" />
              {verificationStatus === 'success' && (
                <CheckCircle className="h-6 w-6 text-green-500 absolute -top-1 -right-1" />
              )}
              {verificationStatus === 'error' && (
                <AlertCircle className="h-6 w-6 text-red-500 absolute -top-1 -right-1" />
              )}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            {verificationStatus === 'success' ? 'Verification Successful!' : 'Verify Your Account'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {verificationStatus === 'success' 
              ? 'Your account has been created successfully. Redirecting to login...'
              : `We've sent a 6-digit OTP to your email and phone number`
            }
          </p>
        </DialogHeader>

        {verificationStatus !== 'success' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={handleOTPChange}
                onKeyPress={handleKeyPress}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                disabled={isVerifying}
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the 6-digit code sent to your registered email and phone
              </p>
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>OTP expires in {formatTime(timeLeft)}</span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyOTP}
                className="w-full"
                disabled={otp.length !== 6 || isVerifying || timeLeft === 0}
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </Button>

              {timeLeft === 0 ? (
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  className="w-full"
                  disabled={timeLeft > 0}
                >
                  Didn't receive OTP? Resend in {formatTime(timeLeft)}
                </Button>
              )}
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={onClose}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <p className="text-sm text-muted-foreground">
              Redirecting to login page...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
