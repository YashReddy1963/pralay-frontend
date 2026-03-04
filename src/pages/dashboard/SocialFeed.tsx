import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ExternalLink,
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

const SocialFeed = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const region = "Pune"; // Later make dynamic

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://pralay-backend-1.onrender.com/api/social/youtube/?region=${region}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch social intelligence");
        }

        const data = await response.json();

        const transformed = data.map((video: any) => ({
          id: video.videoId,
          platform: "YouTube",
          username: video.channelTitle,
          content: video.title,
          timestamp: video.publishedAt,
          location: region,
          likes: 0,
          comments: 0,
          status: "pending",
          priority: "medium",
          classification: "Water Hazard",
          thumbnail: video.thumbnail,
          originalUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
        }));

        setSocialPosts(transformed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialData();
  }, [region]);

  const filteredPosts = socialPosts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filter === "all" || post.status === filter;

    const matchesPlatform =
      platformFilter === "all" ||
      post.platform.toLowerCase() === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Social Intelligence</h1>
          <p className="text-muted-foreground">
            Live YouTube hazard monitoring for {region}
          </p>
        </div>
        <Button size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending Analysis
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {socialPosts.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Signals
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex gap-4 flex-col md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              Fetching hazard signals...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              No relevant hazard posts found.
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="border-l-4 border-l-warning">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">
                      {post.username}
                    </div>
                    <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                      <span>{post.platform}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {post.location}
                      </div>
                    </div>
                  </div>
                  <Badge>Water Hazard</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>{post.content}</p>

                {post.thumbnail && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={post.thumbnail}
                      alt="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <Badge variant="secondary">
                    Medium Priority
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(post.originalUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Original
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;