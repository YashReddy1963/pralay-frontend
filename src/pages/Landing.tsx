import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {QRCodeSVG} from "qrcode.react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  MapPin,
  Globe,
  Zap,
  BarChart3,
  AlertTriangle,
  MessageSquare,
  Brain,
  Smartphone,
  Wifi,
  WifiOff,
  CheckCircle,
  Eye,
  Activity,
  ArrowRight,
  Building2,
  Users2,
  Map,
  Home,
  Camera,
  TrendingUp,
  Clock,
  User,
  Settings,
  Menu,
  Languages,
  RotateCcw
} from "lucide-react";
import { useEffect,useState } from "react";

// Import local images
import LandingPage1 from "./images/LandingPage1.avif";
import LandingPage2 from "./images/LandingPage2.png";
import LandingPage3 from "./images/LandingPage3.png";
import LandingPage4 from "./images/LandingPage4.png";
import Government from "./images/Government.png";


const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://10.216.34.122:8080";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://10.216.34.122:8000";

const Landing = () => {

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
  
    if (isStandalone) {
      setShowInstall(false);
      return;
    }
  
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
  
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  //handle Install Click button
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
  
    deferredPrompt.prompt();
  
    const choice = await deferredPrompt.userChoice;
  
    if (choice.outcome === "accepted") {
      console.log("User installed PWA");
    }
  
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  // Create a smart QR code that provides access to both frontend and backend
  const qrValue = `${FRONTEND_URL}?connect=true&backend=${encodeURIComponent(BACKEND_URL)}`;
  
  return (
    <TooltipProvider>
      <div className="min-h-screen relative">
      {/* Fixed Background Images */}
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full flex animate-slide">
          <div className="min-w-full h-full bg-center bg-no-repeat" style={{
            backgroundImage: `url(${LandingPage1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}></div>
          <div className="min-w-full h-full bg-center bg-no-repeat" style={{
            backgroundImage: `url(${LandingPage2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}></div>
          <div className="min-w-full h-full bg-center bg-no-repeat" style={{
            backgroundImage: `url(${LandingPage3})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}></div>
          <div className="min-w-full h-full bg-center bg-no-repeat" style={{
            backgroundImage: `url(${LandingPage4})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}></div>
        </div>
        
        {/* Transparent Layer for Content Readability */}
        <div className="absolute inset-1 bg-black/30"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-slate-900/95 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Government branding */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
              <img 
  src="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌊</text></svg>" 
  alt="Wave" 
  style={{ width: "32px", height: "32px" }} 
/>

                <span className="text-xl font-bold text-white">Pralay</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-slate-300">
              <div className="flex items-center gap-2">
      
 
     
    </div>
              </div>
            </div>
            
            {/* Center - Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-300 hover:text-white transition-colors flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link to="/" className="text-slate-300 hover:text-white transition-colors">Features</Link>
              <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/" className="text-slate-300 hover:text-white transition-colors">About</Link>
            </nav>
            
            {/* Right side - Auth buttons */}
            <div className="flex items-center space-x-3">
              {showInstall && (
                <Button
                  onClick={handleInstallClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Install App
                </Button>
              )}
              <Button 
              variant="ghost" 
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => navigate("/signin")}>
                Sign In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid - Exactly like the image */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Hero Section */}
          <div className="space-y-8"style={{ transform: "scale(1.05)" }}>
            
            {/* Hero Section */}
            <section className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Integrated Platform for Crowdsourced 
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Ocean Hazard Reporting and Social Media Analytics
                  </span>
                </h1>
                <p className="text-lg text-slate-300 max-w-lg">
                  Unifying National & State Management for Actionable Insights
                </p>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4">
                  Request Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4">
                  Explore Platform
                </Button>
              </div>
              
              {/* Trust Bar */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <span className="text-slate-400 text-sm font-medium">Trusted by:</span>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">NDMA</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <span className="text-white font-medium">G20 INDIA</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 border border-white/20">
                  <Users2 className="h-5 w-5 text-green-400" />
                  <span className="text-white font-medium">NIDMA</span>
                </div>
              </div>
            </section>
            
            {/* Verified Data Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Verified Data, Trusted Decisions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AI Powered Analytics Card */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 cursor-help">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-base">AI Powered Analytics</CardTitle>
                            <CardDescription className="text-slate-400 text-sm">Real-time processing & validation</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Instant Analysis</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Quality Assurance</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span>Automated Triage</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Advanced AI algorithms process and validate disaster reports in real-time, ensuring accuracy and reliability.</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* Zero-Friction Reporting */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 cursor-help">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <Smartphone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-base">Zero-Friction Reporting</CardTitle>
                            <CardDescription className="text-slate-400 text-sm">Multi-channel input system</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <MapPin className="h-4 w-4 text-blue-400" />
                            <span>GPS Auto-Location</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <Camera className="h-4 w-4 text-blue-400" />
                            <span>Photo & Video Upload</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-300">
                            <WifiOff className="h-4 w-4 text-blue-400" />
                            <span>Offline Capability</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Multi-channel reporting system allows citizens and officials to submit disaster reports through SMS, web, or mobile with minimal effort.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </section>
          </div>
          
          {/* Right Column - Alert Cards & Dashboard */}

          <div className="space-y-8 space-x-18"style={{marginLeft:"100px"}}>
            
            {/* Alert Cards Section */}
            <section className="space-y-6">

            <div className="flex flex-col items-center mt-8">
          <p className="text-white mb-4 text-lg">
            Scan this QR code to access both the Pralay app and API services.
          </p>
            <QRCodeSVG
              value={qrValue}
              size={180}
              fgColor="#0f172a"
            />
            <div className="mt-4 text-center">
              <p className="text-slate-300 text-sm mb-2">
                Smart Connection: Opens app + provides API access
              </p>
              <p className="text-slate-400 text-xs mb-3">
                Use your phone's camera or QR scanner app
              </p>
              <div className="mt-2 p-2 bg-slate-700/30 rounded text-xs text-slate-300">
                <p><strong>Frontend:</strong> {FRONTEND_URL}</p>
                <p><strong>Backend:</strong> {BACKEND_URL}</p>
              </div>
              
              {/* Connection Info */}
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-300 text-xs mb-2">What this QR code provides:</p>
                <div className="text-left space-y-1">
                  <p className="text-green-400 text-xs">✓ Opens Pralay Web App</p>
                  <p className="text-green-400 text-xs">✓ Provides Backend API Access</p>
                  <p className="text-green-400 text-xs">✓ Automatic Service Discovery</p>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Frontend: <span className="font-mono">{FRONTEND_URL}</span><br/>
                  Backend: <span className="font-mono">{BACKEND_URL}</span>
                </p>
              </div>
            </div>
           </div>

              <h2 className="text-2xl font-bold text-white">Recent Alerts & Reports</h2>
              
              <div className="space-y-4">
                {/* Large Alert Card */}
                <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-base">@CoastalWatch_Mumbai</CardTitle>
                        <CardDescription className="text-slate-400 text-sm">2 hours ago • AI Verified</CardDescription>
                      </div>
                        <div className="text-xs text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                          AI Verified
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                      "Unusual wave patterns observed at Gateway of India. High tide levels exceeding normal limits. 
                      Coastal flooding risk increasing."
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-400 font-medium">Priority: High</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Small Alert Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <span className="text-white text-sm font-medium">Coastal Flooding</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3">Puri Beach, Odisha</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-400 font-medium">Active</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <span className="text-white text-sm font-medium">High Tide Warning</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3">Mumbai, Maharashtra</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-xs text-amber-400 font-medium">Monitoring</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-green-400" />
                        <span className="text-white text-sm font-medium">Marine Debris</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3">Kochi, Kerala</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-400 font-medium">Resolved</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-purple-400" />
                        <span className="text-white text-sm font-medium">Storm Surge</span>
                      </div>
                      <div className="text-xs text-slate-400 mb-3">Chennai, Tamil Nadu</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-purple-400 font-medium">Under Review</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
            
            {/* NDMA Admin Dashboard */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">NDMA Admin Dashboard</h2>
              
              <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">System Overview</CardTitle>
                    <div className="text-xs text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                      All Systems Operational
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Total Users */}
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-sm font-medium">Total Users</span>
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">12,847</div>
                    <div className="text-xs text-green-400">+286 this month</div>
                  </div>
                  
                  {/* Chart */}
                  <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-slate-400 text-sm font-medium">Weekly Activity</span>
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                    </div>
                      <div className="flex items-end justify-between h-24 space-x-2">
                        <div className="bg-blue-500 rounded-t w-8 h-16 opacity-80"></div>
                        <div className="bg-blue-500 rounded-t w-8 h-20 opacity-80"></div>
                        <div className="bg-blue-500 rounded-t w-8 h-12 opacity-80"></div>
                        <div className="bg-blue-500 rounded-t w-8 h-24 opacity-80"></div>
                        <div className="bg-blue-500 rounded-t w-8 h-18 opacity-80"></div>
                        <div className="bg-blue-500 rounded-t w-8 h-28 opacity-80"></div>
                        <div className="bg-blue-500 rounded-t w-8 h-22 opacity-80"></div>
                      </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-3">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                  
                  {/* Recent Reports */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-base">Recent Reports</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Beach Warning - Goa</span>
                        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs border border-amber-500/30">Under Review</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Marine Alert - Kerala</span>
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/30">Verified</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">Coastal Flood - Odisha</span>
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs border border-red-500/30">Escalated</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* Operational Readiness Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Operational Continuity, Anywhere, Anytime</h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              Highlighting the platform's robustness and accessibility in challenging field environments
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Offline Capture & Synchronization */}
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center relative">
                    <Smartphone className="h-8 w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <WifiOff className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">Offline Capture & Synchronization</CardTitle>
                    <CardDescription className="text-slate-400">Connectivity is Optional</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Ground teams can capture data, multimedia, and geo-location information offline. All data automatically synchronizes with the main server the moment a connection is re-established, ensuring zero data loss.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span>Offline data capture</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <RotateCcw className="h-4 w-4 text-green-400 animate-spin" />
                    <span>Auto-synchronization</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Zero data loss guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Multilingual Support */}
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center relative">
                    <Globe className="h-8 w-8 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Languages className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">Multilingual Support</CardTitle>
                    <CardDescription className="text-slate-400">Language No Barrier</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Full support for major regional languages allows citizens and officials to report and consume data accurately, improving comprehension and speed across diverse linguistic regions.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span>Hindi, English, Tamil, Telugu</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Bengali, Gujarati, Marathi</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Kannada, Malayalam, Punjabi</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>


      {/* Footer */}
      <footer className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Final CTA */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold text-white">
                Ready to Enhance Your Disaster Response?
              </h3>
              <p className="text-lg text-slate-300 max-w-2xl">
                Join the leading disaster management authorities in transforming how we respond to emergencies. 
                Contact our team to schedule a demo and see how Pralay can enhance your operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Contact Our Team
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/citizen">
                  <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-4">Navigation</h4>
                <div className="space-y-2">
                  <Link to="/" className="block text-slate-400 hover:text-white transition-colors">About Us</Link>
                  <Link to="/" className="block text-slate-400 hover:text-white transition-colors">Features</Link>
                  <Link to="/" className="block text-slate-400 hover:text-white transition-colors">Case Studies</Link>
                  <Link to="/" className="block text-slate-400 hover:text-white transition-colors">Contact</Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Supported Authorities</h4>
                <div className="space-y-2 text-slate-400">
                  <div>NDMA - National Disaster Management Authority</div>
                  <div>SDMA - State Disaster Management Authority</div>
                  <div>DDMA - District Disaster Management Authority</div>
                  <div>NIDMA - National Institute of Disaster Management</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              Made with 🤍 by DevMatrix • Empowering disaster resilience through technology
            </p>
          </div>
        </div>
      </footer>
      </div>
    </TooltipProvider>
  );
};

export default Landing;