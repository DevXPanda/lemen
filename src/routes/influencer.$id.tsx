import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Star, Instagram, Youtube, Twitter, Heart, Share2, MessageCircle, Check, Facebook, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFollowers, influencers, type Influencer } from "@/data/influencers";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { convex } from "@/lib/convex";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { useMutation } from "convex/react";

const fallbackCover = "https://api.dicebear.com/7.x/shapes/svg";

export const Route = createFileRoute("/influencer/$id")({
  loader: async ({ params }) => {
    // 1. Try static data first
    let inf = influencers.find((i) => i.id === params.id);
    
    // 2. Try Convex if not found
    if (!inf) {
      try {
        const profile = await convex.query(api.profiles.getById, { id: params.id as any });
        if (profile) {
          const portfolio = await convex.query(api.portfolio.getByProfile, { profileId: profile._id });
          const portfolioImages = portfolio.map((image) => image.url).filter(Boolean) as string[];
          inf = {
            id: profile._id,
            name: profile.fullName,
            handle: profile.handle || `@${profile.fullName.toLowerCase().replace(/\s/g, "")}`,
            category: profile.category || "General",
            followers: (profile.instagramFollowers || 0) + (profile.facebookFollowers || 0) + (profile.linkedinFollowers || 0),
            startingPrice: profile.startingPrice || 0,
            location: profile.location || "India",
            rating: 5.0,
            reviews: 0,
            available: true,
            avatar: profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`,
            cover: profile.coverUrl || `${fallbackCover}?seed=${profile.fullName}`,
            bio: profile.bio || "Creator on Lumen",
            portfolioImages,
            // Socials
            instagramHandle: profile.instagramHandle,
            instagramFollowers: profile.instagramFollowers,
            facebookHandle: profile.facebookHandle,
            facebookFollowers: profile.facebookFollowers,
            linkedinHandle: profile.linkedinHandle,
            linkedinFollowers: profile.linkedinFollowers,
          } as Influencer;
        }
      } catch (e) {
        console.error("Convex profile fetch failed", e);
      }
    }

    if (!inf) throw notFound();
    return { inf };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.inf.name} — Lumen` },
          { name: "description", content: loaderData.inf.bio },
          { property: "og:image", content: loaderData.inf.cover },
        ]
      : [],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-md p-12 text-center">
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md p-12 text-center">
      <h1 className="font-display text-2xl font-bold">Creator not found</h1>
      <Link to="/browse"><Button className="mt-4 rounded-full">Back to browse</Button></Link>
    </div>
  ),
  component: Profile,
});

const tiers = [
  { name: "Story", price: 1, perks: ["1 story slide", "24h live", "Link in story", "Quick turnaround"] },
  { name: "Post", price: 2.5, perks: ["1 in-feed post", "2 revisions", "Caption draft", "Performance recap"], popular: true },
  { name: "Reel", price: 4, perks: ["30–60s reel", "Concept call", "3 revisions", "Cross-post to TikTok"] },
];

function Profile() {
  const { inf } = Route.useLoaderData();
  const { profile: myProfile } = useAuth();
  const startConversation = useMutation(api.messages.startConversation);
  const navigate = useNavigate();

  const handleHire = async () => {
    if (!myProfile) {
      toast.error("Please log in to hire creators");
      return;
    }
    if (myProfile.role !== "brand") {
      toast.error("Only brands can hire creators");
      return;
    }

    try {
      await startConversation({
        creatorId: inf.id as any,
        brandId: myProfile._id,
        initialMessage: `Hi ${inf.name}, I'm interested in working with you!`,
      });
      toast.success("Inquiry sent! Redirecting to chat...");
      navigate({ to: "/dashboard/customer" }); // For now redirect to dashboard
    } catch (e) {
      toast.error("Failed to send inquiry");
      console.error(e);
    }
  };

  const portfolio = inf.portfolioImages?.length
    ? inf.portfolioImages
    : [inf.cover, ...influencers.slice(0, 5).map((i) => i.cover)];
  const statCards = [
    { label: "Total Followers", value: formatFollowers(inf.followers) },
    { label: "Engagement", value: "5.8%" },
    { label: "Avg. reach", value: formatFollowers(Math.round(inf.followers * 0.42)) },
  ];
  const socialCards = [
    {
      label: "Instagram",
      handle: inf.instagramHandle,
      followers: inf.instagramFollowers,
      href: inf.instagramHandle ? `https://instagram.com/${inf.instagramHandle.replace("@", "")}` : "",
      icon: Instagram,
      iconClass: "text-pink-600",
      hoverClass: "hover:border-pink-200 hover:bg-pink-50/30",
    },
    {
      label: "Facebook",
      handle: inf.facebookHandle,
      followers: inf.facebookFollowers,
      href: inf.facebookHandle ? `https://facebook.com/${inf.facebookHandle}` : "",
      icon: Facebook,
      iconClass: "text-blue-600",
      hoverClass: "hover:border-blue-200 hover:bg-blue-50/30",
    },
    {
      label: "LinkedIn",
      handle: inf.linkedinHandle,
      followers: inf.linkedinFollowers,
      href: inf.linkedinHandle ? `https://linkedin.com/in/${inf.linkedinHandle.replace("in/", "")}` : "",
      icon: Linkedin,
      iconClass: "text-blue-800",
      hoverClass: "hover:border-blue-300 hover:bg-blue-50/30",
    },
  ].filter((item) => item.handle);

  return (
    <div>
      {/* COVER */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        <img src={inf.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <Link to="/browse">
            <Button variant="secondary" size="sm" className="rounded-full backdrop-blur">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="-mt-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between relative z-20">
          <div className="flex items-end gap-5">
            <img
              src={inf.avatar}
              alt={inf.name}
              className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-elevated bg-background"
            />
            <div className="pb-2">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">{inf.name}</h1>
                <span className="flex h-6 w-6 items-center justify-center rounded-full gradient-sunset shadow-sm"><Check className="h-3.5 w-3.5 text-white" /></span>
              </div>
              <p className="text-lg font-medium text-muted-foreground/90">{inf.handle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="secondary" className="rounded-full">{inf.category}</Badge>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {inf.location}
                </span>
                <span className="flex items-center gap-1 text-amber">
                  <Star className="h-3 w-3 fill-current" /> {inf.rating} ({inf.reviews})
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast.success("Saved to favorites")}>
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={() => toast("Link copied")}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button className="rounded-full gradient-sunset border-0 text-white shadow-glow" onClick={handleHire}>
              <MessageCircle className="mr-2 h-4 w-4" /> Hire {inf.name.split(" ")[0]}
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {statCards.map((s) => (
                <div key={s.label} className="flex h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
                  <div className="font-display text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
              {socialCards.map((social) => {
                const Icon = social.icon;
                return (
                <a 
                  key={social.label}
                  href={social.href} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`flex h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm transition-all group ${social.hoverClass}`}
                >
                  <Icon className={`mb-1 h-5 w-5 transition-transform group-hover:scale-110 ${social.iconClass}`} />
                  <div className="font-display text-xl font-bold">{formatFollowers(social.followers || 0)}</div>
                  <div className="text-xs text-muted-foreground">{social.label}</div>
                </a>
                );
              })}
            </div>

            <section>
              <h2 className="font-display text-xl font-semibold">About</h2>
              <p className="mt-3 text-muted-foreground">{inf.bio}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Portfolio</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolio.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl">
                    <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* PRICING */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Pricing</h3>
              <p className="text-xs text-muted-foreground">Starting from {formatINR(inf.startingPrice)}</p>

              <div className="mt-5 space-y-3">
                {tiers.map((t) => {
                  const price = Math.round(inf.startingPrice * t.price);
                  return (
                    <div
                      key={t.name}
                      className={`relative rounded-2xl border p-4 transition-colors ${
                        t.popular ? "border-primary/50 bg-accent/40" : "border-border"
                      }`}
                    >
                      {t.popular && (
                        <Badge className="absolute -top-2 right-4 rounded-full border-0 gradient-sunset text-white">Popular</Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold">{t.name}</h4>
                        <span className="font-display text-lg font-bold">{formatINR(price)}</span>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                        {t.perks.map((p) => (
                          <li key={p} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-primary" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <Button className="mt-5 w-full rounded-full gradient-sunset border-0 text-white shadow-glow">
                Request a quote
              </Button>
            </div>
          </aside>
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}
