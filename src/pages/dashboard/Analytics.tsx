import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  Eye,
  Download
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useOfficialLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { toast } from "sonner";

const Analytics = () => {
  const { t } = useOfficialLanguage();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  // Fetch analytics data
  const fetchAnalyticsData = async (days: string) => {
    try {
      setLoading(true);
      const response = await apiService.makeRequest<{
        success: boolean;
        data: {
          metrics: {
            totalReports: number;
            verifiedReports: number;
            pendingReports: number;
            criticalIncidents: number;
            verificationRate: number;
            avgResponseTime: number;
            reportsChange: number;
            verifiedChange: number;
          };
          weeklyTrends: Array<{
            day: string;
            reports: number;
            verified: number;
            date: string;
          }>;
          hazardDistribution: Array<{
            type: string;
            count: number;
            percentage: number;
          }>;
          citizenParticipation: Array<{
            day: string;
            reports: number;
            verified: number;
            date: string;
          }>;
          hotspots: Array<{
            location: string;
            reports: number;
            severity: string;
            state: string;
          }>;
        };
      }>(`/api/analytics/?days=${days}`, {
        method: 'GET',
      });

      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(selectedPeriod);
  }, [selectedPeriod]);

  // Show loading state
  if (loading || !analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const { metrics, weeklyTrends, hazardDistribution, citizenParticipation } = analyticsData;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-destructive";
      case "Medium":
        return "text-warning";
      case "Low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.analytics")} {t("nav.dashboard")}</h1>
          <p className="text-muted-foreground">
            Monitor trends, patterns, and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="transition-smooth hover:scale-105 hover:shadow-lg cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{metrics.totalReports}</div>
                <div className="text-sm text-muted-foreground">{t("official.hazardMap.totalReports")}</div>
                <div className="flex items-center mt-1">
                  {metrics.reportsChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-success mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive mr-1" />
                  )}
                  <span className={`text-xs ${metrics.reportsChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {metrics.reportsChange >= 0 ? '+' : ''}{metrics.reportsChange.toFixed(1)}% from last period
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:scale-105 hover:shadow-lg cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">{metrics.verifiedReports}</div>
                <div className="text-sm text-muted-foreground">{t("official.hazardMap.verified")} {t("nav.reports")}</div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {metrics.verificationRate.toFixed(1)}% verification rate
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:scale-105 hover:shadow-lg cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-warning" />
              <div>
                <div className="text-2xl font-bold">{metrics.avgResponseTime.toFixed(1)}h</div>
                <div className="text-sm text-muted-foreground">{t("official.analytics.avgResponseTime")}</div>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 text-success mr-1" />
                  <span className="text-xs text-success">Response time</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-smooth hover:scale-105 hover:shadow-lg cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">{metrics.criticalIncidents}</div>
                <div className="text-sm text-muted-foreground">{t("official.analytics.criticalIncidents")}</div>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 text-destructive mr-1" />
                  <span className="text-xs text-destructive">Critical level</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Trend Chart (LineChart) */}
        <Card className="transition-smooth hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>{t("official.analytics.weeklyTrends")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="reports" stroke="#f97316" name="Total Reports" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="verified" stroke="#0ea5e9" name="Verified" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hazard Types Distribution (PieChart) */}
        <Card className="transition-smooth hover:shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>{t("official.analytics.hazardDistribution")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip />
                <Legend />
                <Pie data={hazardDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} label>
                  {hazardDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#0ea5e9","#22d3ee","#f97316","#14b8a6","#f43f5e","#6366f1"][index % 6]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Citizen Participation (BarChart) */}
      <Card className="transition-smooth hover:shadow-xl">
        <CardHeader>
          <CardTitle>{t("official.analytics.citizenParticipation")}</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={citizenParticipation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="reports" name="Reports" fill="#f59e0b" />
              <Bar dataKey="verified" name="Verified" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
};

export default Analytics;