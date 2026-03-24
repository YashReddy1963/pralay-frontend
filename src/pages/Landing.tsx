import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Award,
  ArrowRight,
  BarChart3,
  Building2,
  Brain,
  Camera,
  CheckCircle2,
  Landmark,
  MessageSquare,
  Shield,
  Siren,
  Smartphone,
  UserCog,
  Waves,
  WifiOff,
  GraduationCap,
  Presentation,
} from "lucide-react";

import LandingPage1 from "./images/landing.jpeg";
import LandingPage2 from "./images/landing2.jpeg";
import LandingPage3 from "./images/LandingPage3.png";
import LandingPage4 from "./images/LandingPage4.png";
import PralayLogo from "./images/Pralay-logo.png";
import AudienceCitizens from "./images/citizen1.jpg";
import AudienceVolunteers from "./images/volunteer1.avif";
import AudienceDistrict from "./images/Authority.avif";
import AudienceNational from "./images/Government.jpg";
import Capture from "./images/Capture.png";
import verify from "./images/Verify.png";
import Act from  "./images/act.png";
import Techathon from "./images/Techathon.jpeg";
import Dipex from "./images/Dipex.jpeg";
import Mentor from "./images/Mentor.jpeg";
import MIT from "./images/MIT1.jpeg";

const featureCards = [
  {
    icon: Camera,
    title: "Crowdsourced Reporting",
    description: "Citizens submit verified hazard reports with media, location, and context in seconds.",
    iconWrapClass: "bg-primary/15 ring-primary/25 text-primary",
  },
  {
    icon: Brain,
    title: "AI Verification",
    description: "Smart triage and anomaly checks improve quality before actions are escalated.",
    iconWrapClass: "bg-secondary ring-border text-foreground",
  },
  {
    icon: Shield,
    title: "Authority Response",
    description: "National and state teams coordinate response through one reliable workflow.",
    iconWrapClass: "bg-primary/10 ring-primary/20 text-primary",
  },
  {
    icon: BarChart3,
    title: "Social Media Analytics",
    description: "Tracks social activity trends to detect and prioritize emerging coastal hazard signals.",
    iconWrapClass: "bg-secondary ring-border text-foreground",
  },
  {
    icon: UserCog,
    title: "Multi-Level Access Control",
    description: "Role-based permissions for citizens, moderators, and authorities across every workflow stage.",
    iconWrapClass: "bg-primary/15 ring-primary/25 text-primary",
  },
  {
    icon: WifiOff,
    title: "Offline Reporting Mode",
    description: "Captures reports without network and syncs automatically when connectivity is restored.",
    iconWrapClass: "bg-secondary ring-border text-foreground",
  },
];

const audienceCards = [
  {
    title: "Citizens",
    description: "Report hazards quickly with location, photos, and essential details from mobile devices.",
    image: AudienceCitizens,
    imageClassName: "h-full w-full object-cover ",
    toneClassName: "from-primary/10 to-primary/5",
  },
  {
    title: "Volunteers",
    description: "Support ground response by validating reports and helping communities with updates.",
    image: AudienceVolunteers,
    imageClassName: "h-full w-full object-cover",
    toneClassName: "from-emerald-500/10 to-emerald-500/5",
  },
  {
    title: "District Authorities",
    description: "Monitor district-level incidents, assign actions, and coordinate teams in real time.",
    image: AudienceDistrict,
    imageClassName: "h-full w-full object-cover",
    toneClassName: "from-blue-500/10 to-blue-500/5",
  },
  {
    title: "National Agencies",
    description: "Access a unified national view for strategic planning, escalation, and policy decisions.",
    image: AudienceNational,
    imageClassName: "h-full w-full object-cover",
    toneClassName: "from-cyan-500/10 to-cyan-500/5",
  },
];

const authorityLogos = [
  { name: "NDMA", subtitle: "National Disaster Management Authority", icon: Landmark },
  { name: "SDMA", subtitle: "State Disaster Management Authority", icon: Building2 },
  { name: "Coast Guard", subtitle: "Maritime Incident Response", icon: Waves },
  { name: "Emergency Ops", subtitle: "24/7 National Coordination", icon: Siren },
];

const workflowSteps = [
  {
    step: 1,
    title: "Report",
    description: "Citizens and coastal teams submit location-rich reports with photos, videos, and context.",
    icon: MessageSquare,
    image: Capture,
    toneClass: "bg-primary",
    iconClass: "bg-primary text-primary-foreground",
    connectorClass: "from-primary/65 to-primary/30",
  },
  {
    step: 2,
    title: "Verify",
    description: "AI and moderation layers validate urgency, quality, and confidence before escalation.",
    icon: Brain,
    image: verify,
    toneClass: "bg-cyan-500",
    iconClass: "bg-cyan-500/20 text-cyan-700",
    connectorClass: "from-cyan-500/70 to-cyan-500/30",
  },
  {
    step: 3,
    title: "Act",
    description: "Authorities route coordinated response to district and field teams with transparent updates.",
    icon: Shield,
    image: Act,
    toneClass: "bg-blue-400",
    iconClass: "bg-blue-500/20 text-blue-700",
  },
];

const milestoneHighlight = {
  badge: "Winner",
  title: "Techathon 1.0 Winner",
  description:
    "Won first prize for Pralay at Sinhgad Techathon, recognized for innovation in disaster intelligence systems.",
  points: ["Prize: ₹10,000", "Recognition by academic panel"],
  image: Techathon,
};

const milestoneCards = [
  {
    badge: "Shortlisted",
    title: "DIPEX Shortlisted",
    description:
      "Shortlisted for DIPEX innovation exhibition for presenting Pralay as a scalable disaster intelligence solution.",
    image: Dipex,
    icon: GraduationCap,
  },
  {
    badge: "Mentorship",
    title: "Entrepreneur Mentorship",
    description:
      "Guided by entrepreneur mentors on product vision, scalability, and real-world implementation strategy.",
    image: Mentor,
    icon: Award,
  },
  {
    badge: "Presented",
    title: "Innovation Showcase",
    description:
      "Currently presenting at DIPEX, MIT College Sambhajinagar, showcasing innovation to academic and industry audiences.",
    image: MIT,
    icon: Presentation,
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const slideImages = [LandingPage1, LandingPage2, LandingPage3, LandingPage4];
  const transparentCardClass = "rounded-2xl border-border/70 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur";

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideImages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [slideImages.length]);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");

    const checkStandalone = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const syncInstallVisibility = () => {
      const isStandalone = checkStandalone();
      if (isStandalone) {
        setShowInstall(false);
        return;
      }
      setShowInstall(mobileQuery.matches);
    };

    syncInstallVisibility();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mobileQuery.addEventListener("change", syncInstallVisibility);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mobileQuery.removeEventListener("change", syncInstallVisibility);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 shadow-lg shadow-primary/15">
              <img src={PralayLogo} alt="Pralay logo" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <p className="text-lg font-semibold">Pralay</p>
              <p className="text-xs text-muted-foreground">Ocean Hazard Intelligence</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground">Workflow</a>
            <a href="#trust" className="text-sm text-muted-foreground hover:text-foreground">Trust</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/signin")}>Sign In</Button>
            <Button onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.10] via-background to-background">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
          <div className="absolute inset-0 opacity-40">
            <svg viewBox="0 0 1200 400" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,230 C180,140 400,320 620,230 C820,150 980,180 1200,250 L1200,400 L0,400 Z" fill="hsl(var(--primary) / 0.18)" />
              <path d="M0,270 C220,180 460,350 700,265 C880,200 1020,210 1200,300 L1200,400 L0,400 Z" fill="hsl(var(--primary) / 0.10)" />
            </svg>
          </div>

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-28">
            <div className="space-y-7">
              {/* <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-success" /> Trusted by national and state response teams
              </div> */}
            <h1 className="leading-tight tracking-tight text-foreground">
              <span className="inline text-6xl font-extrabold md:text-7xl lg:text-6xl text-blue-900">
                Pralay-
              </span>{" "}
              <span className="inline text-2xl font-bold md:text-3xl lg:text-4xl text-black">
                Integrated Platform for Crowdsourced Ocean Hazard Reporting and Social Media Analytics
              </span>
            </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
               From citizen reports to coordinated response — Pralay enables intelligent, verified disaster action in real time.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button size="lg" className="h-12 w-full px-7 shadow-xl shadow-primary/30 sm:w-auto" onClick={() => navigate("/signup")}>Start Reporting <ArrowRight className="ml-2 h-4 w-4" /></Button>
                {showInstall && (
                  <Button
                    size="lg"
                    onClick={handleInstallClick}
                    className="h-12 w-full px-7 shadow-xl shadow-primary/30 sm:hidden"
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Install App
                  </Button>
                )}
                {/* <Button size="lg" variant="outline" className="h-12 border-primary/30 bg-background/80 px-7" onClick={() => navigate("/dashboard")}>Open Dashboard</Button> */}
              </div>

              <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-3">
                <Card className={transparentCardClass}>
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">24/7</p>
                    <p className="text-xs text-muted-foreground">Monitoring</p>
                  </CardContent>
                </Card>
                <Card className={transparentCardClass}>
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">AI</p>
                    <p className="text-xs text-muted-foreground">Verification</p>
                  </CardContent>
                </Card>
                <Card className={transparentCardClass}>
                  <CardContent className="p-4">
                    <p className="text-2xl font-semibold">Multi-Role</p>
                    <p className="text-xs text-muted-foreground">Access</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-4 ml-10 ">
              <Card className={`overflow-hidden border-primary/20 ${transparentCardClass}`}>
                <CardHeader className="pb-3 pt-5">
                  <CardTitle className="text-xl">Hazard Response Visuals</CardTitle>
                  <CardDescription>Real-time snapshots from the Pralay command ecosystem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted shadow-xl shadow-primary/10">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                    <img
                      src={slideImages[activeSlide]}
                      alt="Pralay platform visual"
                      className="h-full w-full object-cover transition-opacity duration-500"
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    {slideImages.map((_, index) => (
                      <span
                        key={index}
                        className={`h-2.5 w-2.5 rounded-full ${activeSlide === index ? "bg-primary" : "bg-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="trust" className="border-b border-border/60 bg-background">
          <div className="mx-auto w-full max-w-7xl px-6 py-8">
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Trusted Authority Network
            </p>
            <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex w-max gap-3 hover:[animation-play-state:paused] [animation:trust-marquee_22s_linear_infinite]">
              {[...authorityLogos, ...authorityLogos].map((authority, index) => {
                const Icon = authority.icon;
                return (
                  <div key={`${authority.name}-${index}`} className="flex min-w-[260px] items-center gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{authority.name}</p>
                      <p className="text-xs text-muted-foreground">{authority.subtitle}</p>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-border/50 bg-primary/[0.04]">
          <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Core Platform Features</p>
              <h2 className="text-4xl font-bold tracking-tight">Built for high-trust response</h2>
            </div>
            <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">See platform details</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className={`h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 ${transparentCardClass}`}>
                  <CardHeader>
                    <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 shadow-sm transition-all duration-300 ${feature.iconWrapClass}`}>
                      <Icon className="h-6 w-6 stroke-[2.2]" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="mb-10">
            <p className="text-sm text-muted-foreground">Who It’s For</p>
            <h2 className="text-4xl font-bold tracking-tight">Built for every response stakeholder</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {audienceCards.map((audience) => (
              <Card key={audience.title} className={`h-full overflow-hidden border-border/60 ${transparentCardClass}`}>
                <div className={`flex aspect-[4/3] w-full items-start justify-center bg-gradient-to-br ${audience.toneClassName}`}>
                  <img src={audience.image} alt={audience.title} className={audience.imageClassName} />
                </div>
                <CardHeader>
                  <CardTitle>{audience.title}</CardTitle>
                  <CardDescription>{audience.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="workflow" className="relative overflow-hidden border-y border-border/60 bg-gradient-to-b from-primary/[0.07] via-background to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.10),transparent_55%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 top-24 opacity-50" aria-hidden="true">
            <svg viewBox="0 0 1200 220" className="h-[180px] w-full" preserveAspectRatio="none">
              <path d="M0,100 C180,40 320,170 500,110 C650,60 840,140 980,95 C1060,70 1140,90 1200,115" fill="none" stroke="hsl(var(--primary) / 0.16)" strokeWidth="10" strokeLinecap="round" />
              <path d="M0,130 C180,70 320,200 500,140 C650,90 840,170 980,125 C1060,100 1140,120 1200,145" fill="none" stroke="hsl(var(--primary) / 0.10)" strokeWidth="14" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-6 py-24">
            <h2 className="mb-12 text-center text-4xl font-bold tracking-tight">How Pralay works</h2>

            <div className="mx-auto mb-14 hidden max-w-6xl md:flex">
              {workflowSteps.map((step, index) => (
                <div key={`timeline-${step.title}`} className="flex min-w-0 flex-1 items-center ml-28">
                  <div className="flex items-center gap-4">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl font-semibold text-white shadow-lg shadow-primary/25 ${step.toneClass}`}>
                      {step.step}
                    </span>
                    <span className="text-[40px] font-semibold text-foreground">{step.title}</span>
                  </div>
                  {/* {index < workflowSteps.length - 1 ? (
                    <span
                      className={`mx-2 h-1 flex-1 rounded-full bg-gradient-to-r ${step.connectorClass}`}
                      style={{
                        backgroundSize: "14px 4px",
                        backgroundImage: "radial-gradient(circle, hsl(var(--primary) / 0.55) 38%, transparent 42%)",
                      }}
                      aria-hidden="true"
                    />
                  ) : null} */}
                </div>
              ))}
            </div>

            <div className="grid gap-7 md:grid-cols-3">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative">
                    {index < workflowSteps.length - 1 ? (
                      <span className="absolute -right-5 top-[34%] z-10 hidden h-0 w-0 border-b-[12px] border-l-[18px] border-t-[12px] border-b-transparent border-l-primary/35 border-t-transparent lg:block" aria-hidden="true" />
                    ) : null}
                    <Card className="h-full overflow-hidden rounded-[24px] border border-border/75 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
                      <div className="aspect-[16/9] overflow-hidden border-b border-border/60 bg-muted">
                        <img src={step.image} alt={`${step.title} step visual`} className="h-full w-full object-cover" />
                      </div>
                      <CardHeader className="pb-6 pt-5">
                        <div className="mb-3 flex items-center gap-3">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${step.iconClass}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <CardTitle className="text-[36px] leading-none tracking-tight">{step.title}</CardTitle>
                        </div>
                        <CardDescription className="text-lg leading-8 text-muted-foreground">{step.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/*
        
                <section className="relative overflow-hidden border-y border-border/60 bg-gradient-to-b from-primary/[0.08] via-background to-background">
          <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden="true" />

          <div className="relative mx-auto w-full max-w-7xl px-6 py-24">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold tracking-tight">Milestones & Recognition</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Recognized for innovation, validated by experts, and guided by leaders.
              </p>
            </div>

            <div className="relative mb-8">
              <div className="pointer-events-none absolute -inset-2 rounded-[34px] bg-gradient-to-r from-blue-400/35 via-cyan-300/25 to-blue-500/35 blur-md" aria-hidden="true" />
              <div className="pointer-events-none absolute -inset-1 rounded-[32px] border border-blue-300/45 shadow-[0_0_26px_4px_hsl(var(--primary)/0.35),0_0_46px_8px_rgba(56,189,248,0.28)]" aria-hidden="true" />
              <Card className="relative overflow-hidden rounded-[28px] border-primary/30 bg-card/85 shadow-2xl shadow-primary/20 backdrop-blur">
                <div className="grid gap-0 md:grid-cols-[1.2fr_1.6fr]">
                  <div className="relative min-h-[280px] border-b border-border/60 md:border-b-0 md:border-r">
                    <img src={milestoneHighlight.image} alt={milestoneHighlight.title} className="h-full w-full object-cover" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/90 px-4 py-1.5 text-sm font-medium text-foreground shadow-sm">
                      <Award className="h-4 w-4 text-primary" />
                      {milestoneHighlight.badge}
                    </span>
                  </div>

                  <div className="p-7 md:p-10">
                    <h3 className="text-4xl font-bold tracking-tight text-foreground">{milestoneHighlight.title}</h3>
                    <p className="mt-4 text-xl leading-8 text-muted-foreground">{milestoneHighlight.description}</p>
                    <ul className="mt-6 space-y-3">
                      {milestoneHighlight.points.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-lg text-foreground">
                          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {milestoneCards.map((milestone) => {
                const Icon = milestone.icon;
                return (
                  <Card key={milestone.title} className={`h-full overflow-hidden border-border/60 ${transparentCardClass}`}>
                    <CardHeader className="pb-4">
                      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-foreground">
                        <Icon className="h-4 w-4 text-primary" />
                        {milestone.badge}
                      </div>
                      <CardTitle className="pt-2 text-3xl tracking-tight">{milestone.title}</CardTitle>
                      <CardDescription className="text-lg leading-8">{milestone.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border/60 bg-muted">
                        <img src={milestone.image} alt={milestone.title} className="h-full w-full object-cover" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
        */}


        <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-950">
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden="true" />
          <div className="mx-auto w-full max-w-7xl px-6 py-24">
            <Card className="rounded-2xl border border-cyan-300/20 bg-transparent text-primary-foreground shadow-2xl shadow-cyan-950/50">
            <CardContent className="flex flex-col gap-6 p-9 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <h3 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to modernize ocean hazard operations?</h3>
                <p className="mt-2 text-primary-foreground/90">Deploy a secure, coordinated disaster intelligence workflow trusted by national authorities.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="h-12 px-6 shadow-[0_0_40px_hsl(var(--primary)/0.45)]" onClick={() => navigate("/signup")}>Start Reporting</Button>
                <Button variant="outline" className="h-12 border-primary-foreground/40 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/signin")}>Sign In</Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </section>
      </main>
      <style>{`
        @keyframes trust-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default Landing;