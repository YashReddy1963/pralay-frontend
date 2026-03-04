import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Newspaper,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const normalizeText = (value?: string) =>
  (value || "").replace(/\s+/g, " ").trim();

const buildSummaryLines = (article: any, maxLines = 4) => {
  const headline = normalizeText(article?.title);
  const candidates = [article?.news, article?.description, article?.snippet];

  for (const candidate of candidates) {
    const base = normalizeText(candidate);
    if (!base) {
      continue;
    }

    let cleaned = base;
    if (headline && cleaned.toLowerCase().startsWith(headline.toLowerCase())) {
      cleaned = cleaned.slice(headline.length).replace(/^[-:|,.\s]+/, "").trim();
    }

    const sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    if (sentences.length === 0 && cleaned) {
      sentences.push(cleaned);
    }

    const uniqueLines = Array.from(new Set(sentences));
    const lines = uniqueLines.slice(0, maxLines);
    if (lines.length > 0) {
      return lines;
    }
  }

  return [];
};

const NewsFeed = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [mode, setMode] = useState("live"); // live or historical
  const [days, setDays] = useState("30");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const region = "Pune";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = "";

        if (mode === "live") {
          url = `https://pralay-backend-1.onrender.com/api/social/news/?region=${region}&days=${days}`;
        } else {
          url = `https://pralay-backend-1.onrender.com/api/social/google-news/?region=${region}&year=${year}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        setArticles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [region, days, year, mode]);

  const filteredArticles = articles.filter((article) =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            News Intelligence
          </h1>
          <p className="text-muted-foreground">
            Flood & hazard reports for {region}
          </p>
        </div>
        <Button size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Trend Overview
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live (Recent)</SelectItem>
              <SelectItem value="historical">Historical (Last Year)</SelectItem>
            </SelectContent>
          </Select>

          {mode === "live" && (
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          )}

          {mode === "historical" && (
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              Fetching news...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center text-destructive">
              {error}
            </CardContent>
          </Card>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              No news found.
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map((article, index) => {
            const headline = article.title || article.snippet || "Untitled";
            const summaryLines = buildSummaryLines(article, 4);

            return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-lg line-clamp-3">
                      {headline}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                      <Badge variant="outline">
                        {article.source}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.publishedAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {region}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {mode === "historical" ? (
                  <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                    {summaryLines.map((line: string, lineIndex: number) => (
                        <div key={lineIndex}>{line}</div>
                      ))}
                    {summaryLines.length === 0 && "No summary available."}
                  </div>
                ) : article.image ? (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={article.image}
                      alt="news"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    No Image Available
                  </div>
                )}

                {mode !== "historical" &&
                  article.description &&
                  normalizeText(article.description).toLowerCase() !== normalizeText(headline).toLowerCase() && (
                  <p className="text-muted-foreground">
                    {article.description}
                  </p>
                )}

                <Separator />

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(article.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Full Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          )})
        )}
      </div>
    </div>
  );
};

export default NewsFeed;