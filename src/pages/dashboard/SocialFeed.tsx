import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import CreateReportModal from "@/components/modals/CreateReportModal";
import { 
  MessageCircle, 
  Search, 
  Filter, 
  ThumbsUp, 
  ThumbsDown,
  ExternalLink,
  Calendar,
  MapPin,  
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Hash
} from "lucide-react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";

const SocialFeed = () => {
  const { t } = useOfficialLanguage();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [activePost, setActivePost] = useState<any | null>(null);

  // Mock social media data
  const socialPosts = [
    {
      id: "SM001",
      platform: "Twitter",
      username: "@OceanWatchCA",
      userAvatar: "/api/placeholder/40/40",
      content: "🌊⚠️ URGENT: Massive waves hitting Santa Monica Pier right now! At least 6-7 meters high. Beach access closed. Stay safe everyone! #OceanHazard #SantaMonica",
      timestamp: "2024-01-15T14:30:00Z",
      location: "Santa Monica, CA",
      likes: 234,
      retweets: 89,
      status: "relevant" as const,
      priority: "high" as const,
      classification: "High Waves",
      verified: true,
      mediaCount: 2,
      mediaUrls: ["/placeholder.svg", "/placeholder.svg"],
    },
    {
      id: "SM002",
      platform: "Facebook",
      username: "Malibu Beach Watch",
      userAvatar: "/api/placeholder/40/40",
      content: "Tons of plastic debris washing up on our beautiful beaches today. This is heartbreaking. When will we take action? The marine life is suffering. #SaveOurOceans #MarineDebris",
      timestamp: "2024-01-15T11:20:00Z",
      location: "Malibu, CA",
      likes: 156,
      comments: 43,
      status: "relevant" as const,
      priority: "medium" as const,
      classification: "Marine Debris",
      verified: false,
      mediaCount: 4,
      mediaUrls: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    },
    {
      id: "SM003",
      platform: "Instagram",
      username: "@VeniceBeachLife",
      userAvatar: "/api/placeholder/40/40",
      content: "Storm surge flooding the boardwalk parking lot! Cars are getting stuck. City crews are on the way but avoid this area for now. Climate change is real! 🌊😰",
      timestamp: "2024-01-14T16:45:00Z",
      location: "Venice Beach, CA",
      likes: 312,
      comments: 67,
      status: "pending" as const,
      priority: "high" as const,
      classification: "Storm Surge",
      verified: false,
      mediaCount: 1,
      mediaUrls: ["/placeholder.svg"],
    },
    {
      id: "SM004",
      platform: "Twitter",
      username: "@RedondoSurfer",
      userAvatar: "/api/placeholder/40/40",
      content: "Water looks weird today near the pier... kind of greenish-brown. Anyone else notice this? Hope it's not pollution. #RedondoBeach #WaterQuality",
      timestamp: "2024-01-14T09:15:00Z",
      location: "Redondo Beach, CA",
      likes: 45,
      retweets: 12,
      status: "discarded" as const,
      priority: "low" as const,
      classification: "Water Quality",
      verified: false,
      mediaCount: 2,
      mediaUrls: ["/placeholder.svg", "/placeholder.svg"],
    },
    {
      id: "SM005",
      platform: "YouTube",
      username: "Coastal Explorer",
      userAvatar: "/api/placeholder/40/40",
      content: "SHOCKING footage of massive coastal erosion at Manhattan Beach! The tide is washing away the sand dunes. This is unprecedented for this time of year. Full video in comments.",
      timestamp: "2024-01-13T20:30:00Z",
      location: "Manhattan Beach, CA",
      likes: 892,
      comments: 156,
      status: "relevant" as const,
      priority: "high" as const,
      classification: "Coastal Erosion",
      verified: true,
      mediaCount: 1,
      mediaUrls: ["/placeholder.svg"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "relevant":
        return (
          <Badge className="status-verified text-xs flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Relevant</span>
          </Badge>
        );
      case "pending":
        return (
          <Badge className="status-pending text-xs flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>Under Review</span>
          </Badge>
        );
      case "discarded":
        return (
          <Badge className="status-discarded text-xs flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Not Relevant</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-warning";
      case "low":
        return "border-l-muted-foreground";
      default:
        return "border-l-border";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter":
        return <Hash className="h-4 w-4 text-blue-500" />;
      case "Facebook":
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case "Instagram":
        return <MessageCircle className="h-4 w-4 text-pink-500" />;
      case "YouTube":
        return <MessageCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filteredPosts = socialPosts.filter(post => {
    const matchesSearch = 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.classification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filter === "all" || post.status === filter;
    const matchesPlatform = platformFilter === "all" ||
      post.platform.toLowerCase() === platformFilter ||
      (platformFilter === "pralay" && post.platform.toLowerCase() === "pralay");
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const handleStatusChange = (postId: string, newStatus: string) => {
    console.log(`Changing status of ${postId} to ${newStatus}`);
    // In real app, this would update the backend
  };

  const openCreateReport = (post: any) => {
    setActivePost({
      id: post.id,
      platform: post.platform,
      username: post.username,
      content: post.content,
      location: post.location,
      timestamp: post.timestamp,
    });
    setCreateOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.socialFeed")}</h1>
          <p className="text-muted-foreground">
            Monitor social media for ocean hazard reports and relevant content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
{t("official.reports.advancedFilters")}
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
{t("official.social.trendingAnalysis")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{socialPosts.length}</div>
            <div className="text-sm text-muted-foreground">{t("official.social.totalPosts")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {socialPosts.filter(p => p.status === "relevant").length}
            </div>
            <div className="text-sm text-muted-foreground">{t("official.social.relevant")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {socialPosts.filter(p => p.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">{t("official.social.underReview")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {socialPosts.filter(p => p.priority === "high").length}
            </div>
            <div className="text-sm text-muted-foreground">{t("official.hazardMap.highPriority")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search social media posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="relevant">Relevant</SelectItem>
                <SelectItem value="pending">Under Review</SelectItem>
                <SelectItem value="discarded">Not Relevant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="pralay">Pralay (User Reports)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                {searchTerm ? "No posts match your search criteria." : "No social media posts found."}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className={`border-l-4 ${getPriorityColor(post.priority)} hover:shadow-wave transition-wave`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.userAvatar} alt={post.username} />
                      <AvatarFallback>
                        {post.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(post.platform)}
                        <span className="font-semibold">{post.username}</span>
                        {post.verified && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{post.platform}</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                        </div>
                        {post.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(post.status)}
                    <Badge variant="outline" className="text-xs">
                      {post.classification}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-foreground leading-relaxed">
                  {post.content}
                </p>

                {/* Media Thumbnails */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {post.mediaUrls.map((url: string, idx: number) => (
                      <div key={idx} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  {post.retweets && (
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.retweets} retweets</span>
                    </div>
                  )}
                  {post.comments && (
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments} comments</span>
                    </div>
                  )}
                  {post.mediaCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.mediaCount} media</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={post.priority === "high" ? "destructive" : 
                              post.priority === "medium" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)} Priority
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original
                    </Button>
                    
                    {post.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(post.id, "relevant")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Relevant
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStatusChange(post.id, "discarded")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Discard
                        </Button>
                      </>
                    )}
                    
                    {post.status === "relevant" && (
                      <Button size="sm" onClick={() => openCreateReport(post)}>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Create Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateReportModal 
        isOpen={createOpen} 
        onClose={() => setCreateOpen(false)}
        socialPost={activePost ? {
          id: activePost.id,
          platform: activePost.platform,
          content: activePost.content,
          author: activePost.username,
          timestamp: activePost.timestamp,
          location: activePost.location
        } : undefined}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredPosts.length} of {socialPosts.length} posts
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;