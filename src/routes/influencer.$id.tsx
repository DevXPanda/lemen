import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  MapPin,
  Star,
  Instagram,
  Youtube,
  Twitter,
  Heart,
  Share2,
  MessageCircle,
  Check,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatFollowers,
  influencers,
  type Influencer,
} from "@/data/influencers";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { convex } from "@/lib/convex";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";

const QuoraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);

const fallbackCover = "https://api.dicebear.com/7.x/shapes/svg";

export const loader = async ({
  params,
}: {
  params: Record<string, string | undefined>;
}) => {
  // 1. Try static data first
  let inf = influencers.find((i) => i.id === params.id);

  // 2. Try Convex if not found
  if (!inf) {
    try {
      const profile = await convex.query(api.profiles.getById, {
        id: params.id as unknown as Id<"profiles">,
      });
      if (profile) {
        const portfolio = await convex.query(api.portfolio.getByProfile, {
          profileId: profile._id,
        });
        const portfolioImages = portfolio
          .map((image) => image.url)
          .filter(Boolean) as string[];
        const pricingTiers = await convex.query(api.pricing.getByProfile, {
          profileId: profile._id,
        });
        inf = {
          id: profile._id,
          name: profile.fullName,
          handle:
            profile.handle ||
            `@${profile.fullName.toLowerCase().replace(/\s/g, "")}`,
          category: profile.category || "General",
          followers:
            (profile.instagramFollowers || 0) +
            (profile.facebookFollowers || 0) +
            (profile.linkedinFollowers || 0) +
            (profile.youtubeFollowers || 0) +
            (profile.quoraFollowers || 0) +
            (profile.twitterFollowers || 0),
          startingPrice: profile.startingPrice || 0,
          location: profile.location || "India",
          rating: (profile as any).rating ?? 5.0,
          reviews: (profile as any).reviewsCount ?? 0,
          available: true,
          avatar:
            profile.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`,
          cover:
            profile.coverUrl || `${fallbackCover}?seed=${profile.fullName}`,
          bio: profile.bio || "Creator on Lumen",
          portfolioImages,
          // Socials
          instagramHandle: profile.instagramHandle,
          instagramFollowers: profile.instagramFollowers,
          facebookHandle: profile.facebookHandle,
          facebookFollowers: profile.facebookFollowers,
          linkedinHandle: profile.linkedinHandle,
          linkedinFollowers: profile.linkedinFollowers,
          youtubeHandle: profile.youtubeHandle,
          youtubeFollowers: profile.youtubeFollowers,
          quoraHandle: profile.quoraHandle,
          quoraFollowers: profile.quoraFollowers,
          twitterHandle: profile.twitterHandle,
          twitterFollowers: profile.twitterFollowers,
          pricingTiers,
        } as Influencer;
      }
    } catch (e) {
      console.error("Convex profile fetch failed", e);
    }
  }

  if (!inf) throw new Error("Creator not found");
  return { inf };
};

const tiers = [
  {
    name: "Story",
    price: 1,
    perks: ["1 story slide", "24h live", "Link in story", "Quick turnaround"],
  },
  {
    name: "Post",
    price: 2.5,
    perks: [
      "1 in-feed post",
      "2 revisions",
      "Caption draft",
      "Performance recap",
    ],
    popular: true,
  },
  {
    name: "Reel",
    price: 4,
    perks: [
      "30–60s reel",
      "Concept call",
      "3 revisions",
      "Cross-post to TikTok",
    ],
  },
];

export function Profile() {
  const { inf } = useLoaderData() as { inf: Influencer };
  const { profile: myProfile, user, loading: authLoading } = useAuth();
  const startConversation = useMutation(api.messages.startConversation);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: `/influencer/${inf.id}` } });
    }
  }, [user, authLoading, navigate, inf.id]);

  const isFav = useQuery(
    api.profiles.isFavorite,
    myProfile ? { brandId: myProfile._id, creatorId: inf.id } : "skip",
  );
  const toggleFavorite = useMutation(api.profiles.toggleFavorite);

  const submitReview = useMutation(api.reviews.submitReview);

  const stats = useQuery(
    api.reviews.getAverageRating,
    { creatorId: inf.id as unknown as Id<"profiles"> }
  );

  const rating = stats?.rating ?? 5.0;
  const reviewsCount = stats?.reviewsCount ?? 0;

  const reviewEligibility = useQuery(
    api.reviews.canReview,
    myProfile && myProfile.role === "brand"
      ? {
          creatorId: inf.id as unknown as Id<"profiles">,
          brandId: myProfile._id,
        }
      : "skip"
  );
  const canSubmitReview = reviewEligibility?.canReview ?? false;
  const targetConversationId = reviewEligibility?.conversationId;

  // Modal and Form state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submitRating, setSubmitRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [campaignRef, setCampaignRef] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile || !targetConversationId) return;
    if (submitRating === 0) {
      toast.error("Please select a star rating (1-5 stars) before submitting.");
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview({
        creatorId: inf.id as unknown as Id<"profiles">,
        brandId: myProfile._id,
        conversationId: targetConversationId,
        rating: submitRating,
        title: reviewTitle,
        text: reviewText,
        campaignRef: campaignRef || undefined,
      });
      toast.success("Review submitted successfully!");
      setIsReviewModalOpen(false);
      setSubmitRating(0);
      setReviewTitle("");
      setReviewText("");
      setCampaignRef("");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviewsList = useQuery(
    api.reviews.listReviewsForCreator,
    {
      creatorId: inf.id as unknown as Id<"profiles">,
      visibleOnly: true,
    }
  );

  const [sortBy, setSortBy] = useState<"latest" | "highest" | "lowest">("latest");

  const sortedReviews = useMemo(() => {
    if (!reviewsList) return [];
    return [...reviewsList].sort((a, b) => {
      if (sortBy === "latest") {
        return b.createdAt - a.createdAt;
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });
  }, [reviewsList, sortBy]);

  const handleToggleFavorite = async () => {
    if (!myProfile) {
      toast.error("Please log in to save creators");
      return;
    }
    if (myProfile.role !== "brand") {
      toast.error("Only brands can save creators");
      return;
    }

    try {
      const res = await toggleFavorite({
        brandId: myProfile._id,
        creatorId: inf.id,
      });
      if (res.isFavorite) {
        toast.success("Saved to favorites");
      } else {
        toast.success("Removed from favorites");
      }
    } catch (e) {
      toast.error("Failed to update favorites");
      console.error(e);
    }
  };

  useEffect(() => {
    if (inf) {
      document.title = `${inf.name} — Lumen`;
    }
  }, [inf]);

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
        creatorId: inf.id as unknown as Id<"profiles">,
        brandId: myProfile._id,
        initialMessage: `Hi ${inf.name}, I'm interested in working with you!`,
      });
      toast.success("Inquiry sent! Redirecting to chat...");
      navigate("/dashboard/customer"); // For now redirect to dashboard
    } catch (e) {
      toast.error("Failed to send inquiry");
      console.error(e);
    }
  };

  const activeTiers =
    inf.pricingTiers && inf.pricingTiers.length > 0
      ? [...inf.pricingTiers].sort((a, b) => a.sortOrder - b.sortOrder)
      : null;

  const computedStartingPrice =
    activeTiers && activeTiers.length > 0
      ? Math.min(...activeTiers.map((t) => t.price)) || inf.startingPrice
      : inf.startingPrice;

  const displayTiers = activeTiers
    ? activeTiers.map((t) => {
      const nameLower = t.name.toLowerCase();
      let perks: string[] = [];
      let popular = false;
      if (nameLower === "story") {
        perks = [
          "1 story slide",
          "24h live",
          "Link in story",
          "Quick turnaround",
        ];
      } else if (nameLower === "post") {
        perks = [
          "1 in-feed post",
          "2 revisions",
          "Caption draft",
          "Performance recap",
        ];
        popular = true;
      } else if (nameLower === "reel") {
        perks = [
          "30–60s reel",
          "Concept call",
          "3 revisions",
          "Cross-post to TikTok",
        ];
      } else {
        perks = [
          `1 ${t.name} deliverable`,
          "Professional content",
          "1 revision included",
          "Fast delivery",
        ];
      }
      return {
        name: t.name,
        price: t.price,
        perks,
        popular,
      };
    })
    : tiers.map((t) => ({
      name: t.name,
      price: Math.round(inf.startingPrice * t.price),
      perks: t.perks,
      popular: t.popular,
    }));

  const portfolio = inf.portfolioImages?.length
    ? inf.portfolioImages
    : [inf.cover, ...influencers.slice(0, 5).map((i) => i.cover)];

  const connectedPlatforms = [
    {
      handle: inf.instagramHandle,
      followers: inf.instagramFollowers || 0,
      reachRate: 0.35,
      viewRate: 0.12,
    },
    {
      handle: inf.facebookHandle,
      followers: inf.facebookFollowers || 0,
      reachRate: 0.15,
      viewRate: 0.05,
    },
    {
      handle: inf.linkedinHandle,
      followers: inf.linkedinFollowers || 0,
      reachRate: 0.25,
      viewRate: 0.08,
    },
    {
      handle: inf.youtubeHandle,
      followers: inf.youtubeFollowers || 0,
      reachRate: 0.5,
      viewRate: 0.25,
    },
    {
      handle: inf.quoraHandle,
      followers: inf.quoraFollowers || 0,
      reachRate: 0.3,
      viewRate: 0.15,
    },
    {
      handle: inf.twitterHandle,
      followers: inf.twitterFollowers || 0,
      reachRate: 0.2,
      viewRate: 0.1,
    },
  ].filter((p) => p.handle);

  const numConnected = connectedPlatforms.length;

  const avgFollowersValue =
    numConnected > 0 ? Math.round(inf.followers / numConnected) : 0;
  const totalReach = connectedPlatforms.reduce(
    (acc, p) => acc + p.followers * p.reachRate,
    0,
  );
  const avgReachValue =
    numConnected > 0 ? Math.round(totalReach / numConnected) : 0;
  const totalViews = connectedPlatforms.reduce(
    (acc, p) => acc + p.followers * p.viewRate,
    0,
  );
  const avgViewsValue =
    numConnected > 0 ? Math.round(totalViews / numConnected) : 0;
  const totalPostsValue = inf.portfolioImages?.length || 0;

  const statCards = [
    { label: "Average Followers", value: formatFollowers(avgFollowersValue) },
    { label: "Average Reach", value: formatFollowers(avgReachValue) },
    { label: "Average Views", value: formatFollowers(avgViewsValue) },
    { label: "Total Posts", value: totalPostsValue.toString() },
  ];
  const socialCards = [
    {
      label: "Instagram",
      handle: inf.instagramHandle,
      followers: inf.instagramFollowers,
      href: inf.instagramHandle
        ? `https://instagram.com/${inf.instagramHandle.replace("@", "")}`
        : "",
      icon: Instagram,
      iconClass: "text-pink-600",
      hoverClass: "hover:border-pink-200 hover:bg-pink-50/30",
    },
    {
      label: "Facebook",
      handle: inf.facebookHandle,
      followers: inf.facebookFollowers,
      href: inf.facebookHandle
        ? `https://facebook.com/${inf.facebookHandle}`
        : "",
      icon: Facebook,
      iconClass: "text-blue-600",
      hoverClass: "hover:border-blue-200 hover:bg-blue-50/30",
    },
    {
      label: "LinkedIn",
      handle: inf.linkedinHandle,
      followers: inf.linkedinFollowers,
      href: inf.linkedinHandle
        ? `https://linkedin.com/in/${inf.linkedinHandle.replace("in/", "")}`
        : "",
      icon: Linkedin,
      iconClass: "text-blue-800",
      hoverClass: "hover:border-blue-300 hover:bg-blue-50/30",
    },
    {
      label: "YouTube",
      handle: inf.youtubeHandle,
      followers: inf.youtubeFollowers,
      href: inf.youtubeHandle
        ? `https://youtube.com/@${inf.youtubeHandle.replace("@", "")}`
        : "",
      icon: Youtube,
      iconClass: "text-red-600",
      hoverClass: "hover:border-red-200 hover:bg-red-50/30",
    },
    {
      label: "Quora",
      handle: inf.quoraHandle,
      followers: inf.quoraFollowers,
      href: inf.quoraHandle
        ? `https://quora.com/profile/${inf.quoraHandle}`
        : "",
      icon: QuoraIcon,
      iconClass: "text-red-700",
      hoverClass: "hover:border-red-200 hover:bg-red-50/30",
    },
    {
      label: "X (Twitter)",
      handle: inf.twitterHandle,
      followers: inf.twitterFollowers,
      href: inf.twitterHandle
        ? `https://x.com/${inf.twitterHandle.replace("@", "")}`
        : "",
      icon: Twitter,
      iconClass: "text-sky-500",
      hoverClass: "hover:border-sky-200 hover:bg-sky-50/30",
    },
  ].filter((item) => item.handle);

  return (
    <div>
      {/* COVER */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        <img src={inf.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background 30  via-background/1 to-transparent" />
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <Link to="/browse">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full backdrop-blur"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="-mt-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between relative z-20">
          <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-end sm:text-left sm:gap-5">
            <img
              src={inf.avatar}
              alt={inf.name}
              className="h-32 w-32 rounded-full border-4 border-background object-cover shadow-elevated bg-background"
            />
            <div className="pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
                  {inf.name}
                </h1>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-sunset shadow-sm">
                  <Check className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <p className="text-lg font-medium text-muted-foreground/90">
                {inf.handle}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <Badge variant="secondary" className="rounded-full">
                  {inf.category}
                </Badge>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {inf.location}
                </span>
                <span className="flex items-center gap-1 text-amber">
                  <Star className="h-3 w-3 fill-current" /> {rating} ({reviewsCount})
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center sm:justify-start gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full transition-colors ${isFav
                ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                : ""
                }`}
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${isFav ? "fill-current text-red-500" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => toast("Link copied")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {canSubmitReview && (
              <Button
                variant="outline"
                className="rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-secondary transition-colors"
                onClick={() => setIsReviewModalOpen(true)}
              >
                <Star className="h-4 w-4 fill-amber text-amber" />
                Rate Creator
              </Button>
            )}
            {/* <Button
              className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              onClick={handleHire}
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Hire{" "}
              {inf.name.split(" ")[0]}
            </Button> */}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statCards.map((s) => (
                <div
                  key={s.label}
                  className="flex h-28 flex-col items-center justify-center rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
                >
                  <div className="font-display text-xl font-bold">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            {socialCards.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
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
                      <Icon
                        className={`mb-1 h-5 w-5 transition-transform group-hover:scale-110 ${social.iconClass}`}
                      />
                      <div className="font-display text-xl font-bold">
                        {formatFollowers(social.followers || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {social.label}
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* <section>
              <h2 className="font-display text-xl font-semibold">About</h2>
              <p className="mt-3 text-muted-foreground">{inf.bio}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold">Portfolio</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {portfolio.map((src, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-2xl"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </section> */}
            <div className="grid gap-8 lg:grid-cols-2 items-stretch">
              {/* ABOUT */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
                <section className="flex-1 flex flex-col h-full">
                  <h2 className="font-display text-xl font-semibold">About</h2>
                  <div className="mt-3 max-h-48 overflow-y-auto pr-2 flex-1">
                    <p className="text-muted-foreground">{inf.bio}</p>
                  </div>
                </section>
              </div>

              {/* PORTFOLIO */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
                <section className="flex-1 flex flex-col h-full">
                  <h2 className="font-display text-xl font-semibold">
                    Portfolio
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {portfolio.map((src, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square overflow-hidden rounded-2xl"
                      >
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* REVIEWS & FEEDBACK */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-xl font-semibold">Reviews & Feedback</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    What brands are saying about collaborating with {inf.name}
                  </p>
                </div>

                {/* Sorting Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="latest">Latest</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {!reviewsList ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading reviews...
                </div>
              ) : sortedReviews.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-xl">
                  <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="font-semibold text-sm text-muted-foreground">No reviews yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed collaborations will appear here once reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedReviews.map((review) => (
                    <div
                      key={review._id}
                      className="border border-border rounded-xl p-4 transition-colors hover:bg-accent/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        {/* Reviewer and Rating */}
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              review.brandAvatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${review.brandName}`
                            }
                            alt=""
                            className="h-10 w-10 rounded-full object-cover border border-border/50 shadow-sm aspect-square"
                          />
                          <div>
                            <h4 className="font-display text-sm font-semibold text-foreground">
                              {review.brandName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? "fill-amber text-amber"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Optional Campaign Ref */}
                        {review.campaignRef && (
                          <Badge variant="secondary" className="text-[10px] rounded-full self-start">
                            Campaign: {review.campaignRef}
                          </Badge>
                        )}
                      </div>

                      {/* Review Title and Text */}
                      <div className="mt-3 pl-0 sm:pl-13">
                        <h5 className="text-sm font-semibold text-foreground">
                          {review.title}
                        </h5>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PRICING */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Pricing</h3>
              <p className="text-xs text-muted-foreground">
                Starting from {formatINR(computedStartingPrice)}
              </p>

              <div className="mt-5 space-y-3">
                {displayTiers.map((t) => {
                  return (
                    <div
                      key={t.name}
                      className={`relative rounded-2xl border p-4 transition-colors ${t.popular
                        ? "border-primary/50 bg-accent/40"
                        : "border-border"
                        }`}
                    >
                      {t.popular && (
                        <Badge className="absolute -top-2 right-4 rounded-full border-0 gradient-sunset text-white">
                          Popular
                        </Badge>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-semibold">{t.name}</h4>
                        <span className="font-display text-lg font-bold">
                          {formatINR(t.price)}
                        </span>
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

              {/* <Button className="mt-5 w-full rounded-full gradient-sunset border-0 text-white shadow-glow">
                Request a quote
              </Button> */}
              <div className="mt-5 flex justify-center sm:justify-start">
                <Button
                  className="w-full sm:w-auto rounded-full gradient-sunset border-0 text-white shadow-glow px-6 py-2.5 flex items-center justify-center gap-2"
                  onClick={handleHire}
                >
                  <MessageCircle className="h-5 w-5" /> Hire {inf.name.split(" ")[0]}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <div className="h-20" />
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Rate {inf.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Share your collaboration experience. Only you and other brands will see your brand name.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Overall Rating</Label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSubmitRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= submitRating
                          ? "fill-amber text-amber"
                          : "text-muted-foreground/30 hover:text-amber/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-title" className="text-xs font-semibold text-muted-foreground">
                Review Title
              </Label>
              <Input
                id="review-title"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g., Exceptional content quality & communication!"
                className="rounded-xl border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="review-text" className="text-xs font-semibold text-muted-foreground">
                Detailed Feedback
              </Label>
              <Textarea
                id="review-text"
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your experience working with this creator, content performance, promptness..."
                className="rounded-xl border-border bg-background resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-ref" className="text-xs font-semibold text-muted-foreground">
                Campaign Reference <span className="text-muted-foreground/60">(Optional)</span>
              </Label>
              <Input
                id="campaign-ref"
                value={campaignRef}
                onChange={(e) => setCampaignRef(e.target.value)}
                placeholder="e.g., Summer Launch 2026"
                className="rounded-xl border-border bg-background"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingReview}
                className="rounded-full flex-1 gradient-sunset border-0 text-white shadow-glow"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
