import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles, Star, TrendingUp, Users, Zap, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categories, formatFollowers, influencers, type Influencer } from "@/data/influencers";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import heroBanner from "@/assets/hero-banner.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Hire creators that move the needle" },
      { name: "description", content: "The marketplace where brands meet vetted influencers across every niche." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const liveCreators = useQuery(api.profiles.list, { role: "creator" }) || [];
  const featured = useMemo(() => {
    const live = liveCreators.map((p) => ({
      id: p._id,
      name: p.fullName,
      handle: p.handle || `@${p.fullName.toLowerCase().replace(/\s/g, "")}`,
      category: p.category || "General",
      followers: (p.instagramFollowers || 0) + (p.facebookFollowers || 0) + (p.linkedinFollowers || 0),
      startingPrice: p.startingPrice || 0,
      location: p.location || "India",
      rating: 5.0,
      reviews: 0,
      available: true,
      avatar: p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.fullName}`,
      cover: p.coverUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.fullName}`,
      bio: p.bio || "",
    } as Influencer));

    const orderedLive = [...live].sort((a, b) => {
      if (profile?.role === "creator") {
        if (a.id === profile._id) return -1;
        if (b.id === profile._id) return 1;
      }
      return 0;
    });

    return [...orderedLive, ...influencers].slice(0, 6);
  }, [liveCreators, profile]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/browse", search: { search: searchQuery.trim() } });
    } else {
      navigate({ to: "/browse" });
    }
  };

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background banner image */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBanner}
            alt="Featured creators across fashion, fitness, tech, beauty, travel and food"
            className="h-full w-full object-cover scale-110 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/75 to-background" />
          <div className="absolute inset-0 bg-background/40" />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full gradient-warm opacity-20 blur-3xl animate-blob" />
          <div className="absolute top-20 right-0 h-[28rem] w-[28rem] rounded-full gradient-pink opacity-20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="rounded-full border border-border bg-card/80 px-4 py-1.5 backdrop-blur">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Over 50,000 vetted creators
            </Badge>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Where brands meet
              <br />
              <span className="text-gradient-sunset">creators that convert.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Discover vetted influencers across every niche. Launch campaigns in days, not weeks. Get measurable results.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card/90 p-2 shadow-soft backdrop-blur focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <input
                placeholder="Try 'fashion creator in Paris'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="rounded-full gradient-sunset border-0 text-white shadow-glow">
                Search <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/browse">
                <Button size="lg" className="rounded-full gradient-sunset border-0 text-white shadow-glow transition-transform hover:scale-105 hover:opacity-95">
                  Find creators <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-full border-border bg-card/80 backdrop-blur transition-colors hover:bg-secondary hover:text-foreground">
                  Become an influencer
                </Button>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              {["Fashion", "Tech", "Beauty", "Gaming"].map((c) => (
                <span key={c} className="rounded-full border border-border bg-card/80 px-3 py-1 backdrop-blur">{c}</span>
              ))}
            </div>
          </div>

          {/* hero floating cards */}
          <div className="relative mt-16 hidden w-full md:block">
            <div className="grid grid-cols-3 gap-6">
              {featured.slice(0, 3).map((inf, i) => (
                <div
                  key={inf.id}
                  className="animate-float cursor-pointer rounded-3xl border border-border bg-card p-4 transition-all duration-500 hover:-translate-y-3 hover:scale-105 hover:border-primary/40 hover:shadow-elevated"
                  style={{ animationDelay: `${i * 1.2}s`, transform: i === 1 ? "translateY(-24px)" : "" }}
                >
                  <img src={inf.avatar} alt={inf.name} className="mb-3 h-14 w-14 rounded-2xl object-cover" />
                  <p className="font-display text-sm font-semibold">{inf.name}</p>
                  <p className="text-xs text-muted-foreground">{inf.category} · {formatFollowers(inf.followers)}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold">{formatINR(inf.startingPrice)}</span>
                    <span className="flex items-center gap-1 text-amber"><Star className="h-3 w-3 fill-current" />{inf.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Users, label: "Active creators", value: "52K+" },
            { icon: TrendingUp, label: "Campaigns run", value: "184K" },
            { icon: Zap, label: "Avg. launch time", value: "3.2 days" },
            { icon: CheckCircle2, label: "Success rate", value: "96%" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Browse by category</h2>
            <p className="mt-2 text-muted-foreground">Find the perfect voice for your brand.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/browse"
              className="group rounded-3xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-none"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-2xl transition-transform group-hover:scale-110">
                {c.emoji}
              </div>
              <h3 className="font-display font-semibold">{c.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.count} creators</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Featured creators</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked by our team this week.</p>
          </div>
          <Link to="/browse" className="hidden text-sm font-medium text-primary hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((inf) => (
            <Link
              key={inf.id}
              to="/influencer/$id"
              params={{ id: inf.id }}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-elevated"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={inf.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute right-3 top-3 rounded-full border-0 bg-white/90 text-foreground backdrop-blur">
                  {inf.category}
                </Badge>
              </div>
              <div className="-mt-10 px-5 pb-5">
                <img
                  src={inf.avatar}
                  alt={inf.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="relative z-10 h-20 w-20 rounded-full border-4 border-card object-cover shadow-elevated bg-muted"
                />
                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold">{inf.name}</h3>
                    <p className="text-xs text-muted-foreground">{inf.handle}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-amber">
                    <Star className="h-4 w-4 fill-current" />
                    {inf.rating}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {inf.location.split(",")[0]}
                  </span>
                  <span><strong>{formatFollowers(inf.followers)}</strong> <span className="text-muted-foreground">followers</span></span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-display text-lg font-bold text-gradient-sunset">{formatINR(inf.startingPrice)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] gradient-sunset p-10 text-center text-white shadow-glow sm:p-16">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white, transparent 40%), radial-gradient(circle at 80% 60%, white, transparent 40%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold sm:text-5xl">Ready to launch your next campaign?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">Join 12,000+ brands using Lumen to grow with creators.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                  Start free
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                  Explore creators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
