import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  MapPin,
  TrendingUp,
  Activity,
  Eye,
  Plus,
  BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useAdminLanguage } from "@/contexts/LanguageContext";

const AdminDashboard = () => {
  const { t } = useAdminLanguage();
  const stats = [
    {
      title: t("admin.dashboard.totalUsers"),
      value: "12,847",
      change: "+286 this month",
      icon: Users,
      color: "text-primary-glow"
    },
    {
      title: t("admin.dashboard.activeOfficials"),
      value: "156",
      change: "+12 this week",
      icon: Shield,
      color: "text-success"
    },
    {
      title: t("admin.dashboard.totalReports"),
      value: "1,234",
      change: "+45 today",
      icon: AlertTriangle,
      color: "text-warning"
    },
    {
      title: t("admin.dashboard.regionsCovered"),
      value: "28",
      change: "All coastal states",
      icon: MapPin,
      color: "text-info"
    }
  ];

  const recentReports = [
    {
      id: "HR001",
      type: "Cyclone Warning",
      location: "Chennai, Tamil Nadu",
      reporter: "Citizen User",
      time: "2 hours ago",
      status: "Verified"
    },
    {
      id: "HR002",
      type: "High Tide",
      location: "Mumbai, Maharashtra",
      reporter: "Local Official",
      time: "4 hours ago",
      status: "Under Review"
    },
    {
      id: "HR003",
      type: "Tsunami Alert",
      location: "Visakhapatnam, AP",
      reporter: "AI Detection",
      time: "6 hours ago",
      status: "Escalated"
    }
  ];

  const regionalStats = [
    { state: "Tamil Nadu", reports: 234, officials: 28 },
    { state: "Maharashtra", reports: 189, officials: 24 },
    { state: "Kerala", reports: 167, officials: 22 },
    { state: "Gujarat", reports: 145, officials: 20 },
    { state: "West Bengal", reports: 132, officials: 18 }
  ];

  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-to-br from-card/50 to-card/30 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hazard Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{t("admin.dashboard.recentHazardReports")}</CardTitle>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">{report.type}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === 'Verified' 
                          ? 'bg-success/20 text-success' 
                          : report.status === 'Under Review'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.location}</p>
                    <p className="text-xs text-muted-foreground">{report.reporter} • {report.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{t("admin.dashboard.regionalStatistics")}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAnalyticsOpen(true)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              {t("admin.dashboard.analytics")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionalStats.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{region.state}</p>
                    <p className="text-sm text-muted-foreground">
                      {region.officials} officials active
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-glow">{region.reports}</p>
                    <p className="text-xs text-muted-foreground">reports</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>{t("admin.dashboard.regionalStatistics")} {t("admin.dashboard.analytics")}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RBarChart data={regionalStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reports" name="Reports" fill="#0ea5e9" />
                <Bar dataKey="officials" name="Officials" fill="#f97316" />
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("admin.dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Register New Official
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Broadcast Emergency Alert
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              {t("admin.dashboard.systemHealthCheck")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{t("admin.dashboard.systemHealth")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Classification</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-xs text-warning">Updating</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Mobile App</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-xs text-success">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;