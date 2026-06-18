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
  UserPlus,
  Clock,
  Users,
  Globe,
  ShieldCheck,
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
  mockBrands,
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
  let inf = influencers.find((i) => i.id === params.id) || mockBrands.find((b) => b.id === params.id);

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

        let campaigns: any[] = [];
        let campaignsCount = 0;
        let hiredCount = 0;
        if (profile.role === "brand") {
          try {
            campaigns = await convex.query(api.campaigns.getByBrand, {
              brandId: profile._id,
            });
            campaignsCount = campaigns.length;
            const conversations = await convex.query(api.messages.getConversations, {
              profileId: profile._id,
              role: "brand",
            });
            hiredCount = conversations?.filter((c) => c.status === "completed" || c.status === "active").length || 0;
          } catch (e) {
            console.error("Failed to query campaigns/conversations in loader", e);
          }
        }

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
          bio: profile.bio || (profile.role === "brand" ? "Brand details on  Pravixo" : "Creator on  Pravixo"),
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
          role: profile.role,
          verificationStatus: profile.verificationStatus,
          // Brand fields
          website: profile.website,
          companySize: profile.companySize,
          prefNiches: profile.prefNiches,
          prefBudget: profile.prefBudget,
          prefReach: profile.prefReach,
          prefRegions: profile.prefRegions,
          campaigns,
          campaignsCount,
          hiredCount,
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

const getBrandProfileDetails = (brandId: string, brandName: string) => {
  const nameLower = brandName.toLowerCase();
  const isNike = nameLower.includes("nike");
  const isZomato = nameLower.includes("zomato");
  const isTata = nameLower.includes("tata") || nameLower.includes("hawa");

  let companySize = "50 - 200 employees";
  let website = "https://www.hawai.restaurant";
  let campaignsCount = 14;
  let hiredCount = 52;
  let activeCampaignsCount = 2;
  let successRate = "95%";

  if (isNike) {
    companySize = "10,000+ employees";
    website = "https://www.nike.com/in";
    campaignsCount = 24;
    hiredCount = 180;
    activeCampaignsCount = 3;
    successRate = "98%";
  } else if (isZomato) {
    companySize = "5,000 - 10,000 employees";
    website = "https://www.zomato.com";
    campaignsCount = 36;
    hiredCount = 320;
    activeCampaignsCount = 5;
    successRate = "96%";
  } else if (isTata) {
    companySize = "50,000+ employees";
    website = "https://www.tatamotors.com";
    campaignsCount = 15;
    hiredCount = 95;
    activeCampaignsCount = 2;
    successRate = "99%";
  }

  // Gallery
  const defaultGallery = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
  ];

  let gallery = defaultGallery;
  if (isNike) {
    gallery = [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&q=80",
    ];
  } else if (isZomato) {
    gallery = [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    ];
  } else if (isTata) {
    gallery = [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
    ];
  }

  // Campaigns
  let campaigns = [
    {
      id: "camp_hawai_1",
      title: "Dine-in Experience Video Campaign",
      budget: "₹20,000 - ₹40,000",
      category: "Food & Vlogging",
      duration: "2 weeks",
      applications: 18,
    },
    {
      id: "camp_hawai_2",
      title: "Family Weekend Feast Reels",
      budget: "₹30,000 - ₹50,000",
      category: "Food & Family",
      duration: "3 weeks",
      applications: 27,
    },
  ];

  if (isNike) {
    campaigns = [
      {
        id: "nike_c1",
        title: "Air Max Day 2026 Campaign",
        budget: "₹1,50,000 - ₹3,00,000",
        category: "Fashion & Sports",
        duration: "3 weeks",
        applications: 68,
      },
      {
        id: "nike_c2",
        title: "Just Do It: Running Series",
        budget: "₹80,000 - ₹1,50,000",
        category: "Fitness & Athletics",
        duration: "1 month",
        applications: 112,
      },
    ];
  } else if (isZomato) {
    campaigns = [
      {
        id: "zomato_c1",
        title: "Late Night Cravings Reels",
        budget: "₹30,000 - ₹60,000",
        category: "Food & Entertainment",
        duration: "2 weeks",
        applications: 145,
      },
      {
        id: "zomato_c2",
        title: "Healthy Options Launch Campaign",
        budget: "₹60,000 - ₹1,20,000",
        category: "Food & Health",
        duration: "3 weeks",
        applications: 89,
      },
    ];
  } else if (isTata) {
    campaigns = [
      {
        id: "tata_c1",
        title: "Tata Punch EV Roadtrip Vlog",
        budget: "₹2,50,000 - ₹5,00,000",
        category: "Automobile & Travel",
        duration: "1 month",
        applications: 56,
      },
      {
        id: "tata_c2",
        title: "Urban EV Commuter Campaign",
        budget: "₹1,00,000 - ₹2,00,000",
        category: "Automobile & Tech",
        duration: "2 weeks",
        applications: 37,
      },
    ];
  }

  // Preferences
  let preferences = {
    niches: "Food, Dining, Family Vlogs, Lifestyle",
    reach: "10K+ followers",
    region: "Delhi & NCR",
    budgetRange: "₹10K - ₹40K per post",
  };

  if (isNike) {
    preferences = {
      niches: "Sports, Fitness, Running, Lifestyle",
      reach: "50K+ followers",
      region: "India (Metros)",
      budgetRange: "₹25K - ₹100K per post",
    };
  } else if (isZomato) {
    preferences = {
      niches: "Food, Cooking, Vlogging, Comedy, Lifestyle",
      reach: "20K+ followers",
      region: "India (All major cities)",
      budgetRange: "₹15K - ₹50K per reel",
    };
  } else if (isTata) {
    preferences = {
      niches: "Automobile, Tech, Travel, Family, Sustainability",
      reach: "100K+ followers",
      region: "India",
      budgetRange: "₹50K - ₹200K per deliverable",
    };
  }

  return {
    companySize,
    website,
    campaignsCount,
    hiredCount,
    activeCampaignsCount,
    successRate,
    gallery,
    campaigns,
    preferences,
  };
};

export function Profile() {
  const { inf } = useLoaderData() as { inf: Influencer };
  const { profile: myProfile, user, loading: authLoading } = useAuth();

  const isMockId = inf.id.startsWith("brand_mock_") || !isNaN(Number(inf.id));
  const verifiedConnections = useQuery(
    api.social.getConnections,
    !isMockId ? { profileId: inf.id as unknown as Id<"profiles"> } : "skip"
  );

  const isBrand = inf.role === "brand";
  const brandDetails = useMemo(() => {
    if (!isBrand) return null;
    const isMock = inf.id.startsWith("brand_mock_") || !isNaN(Number(inf.id));
    if (isMock) {
      return getBrandProfileDetails(inf.id, inf.name);
    }

    const activeCamps = (inf.campaigns || []).filter((c) => c.active === true);
    const dbGallery = inf.portfolioImages && inf.portfolioImages.length > 0
      ? inf.portfolioImages
      : [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
          "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
        ];

    return {
      companySize: inf.companySize || "50 - 200 employees",
      website: inf.website || "https:// Pravixo.co",
      campaignsCount: inf.campaignsCount ?? 0,
      hiredCount: inf.hiredCount ?? 0,
      activeCampaignsCount: activeCamps.length,
      successRate: "98%",
      gallery: dbGallery,
      campaigns: activeCamps.map((c: any) => ({
        id: c._id,
        title: c.title,
        budget: c.budget,
        category: c.category,
        duration: c.duration,
        applications: 0,
      })),
      preferences: {
        niches: inf.prefNiches || "General",
        reach: inf.prefReach || "Any",
        region: inf.prefRegions || "Any",
        budgetRange: inf.prefBudget || "Any",
      },
    };
  }, [isBrand, inf]);
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

  const connectionStatus = useQuery(
    api.connections.getConnectionStatus,
    myProfile && myProfile.role === "creator" && !isMockId
      ? {
          creatorId: myProfile._id,
          brandId: inf.id as unknown as Id<"profiles">,
        }
      : "skip"
  );
  const sendConnectionRequest = useMutation(api.connections.sendRequest);

  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [pitchText, setPitchText] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile) return;
    if (!pitchText.trim()) {
      toast.error("Please enter a personalized pitch");
      return;
    }
    setSendingRequest(true);
    try {
      if (isMockId) {
        toast.success("Connection request sent to mock brand!");
        setIsConnectionModalOpen(false);
        setPitchText("");
      } else {
        await sendConnectionRequest({
          creatorId: myProfile._id,
          brandId: inf.id as unknown as Id<"profiles">,
          pitch: pitchText,
        });
        toast.success("Connection request sent!");
        setIsConnectionModalOpen(false);
        setPitchText("");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  const stats = useQuery(
    api.reviews.getAverageRating,
    isMockId ? "skip" : { creatorId: inf.id as unknown as Id<"profiles"> }
  );

  const rating = stats?.rating ?? inf.rating ?? 5.0;
  const reviewsCount = stats?.reviewsCount ?? inf.reviews ?? 0;

  const reviewEligibility = useQuery(
    api.reviews.canReview,
    myProfile && myProfile.role === "brand" && !isMockId
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
    isMockId
      ? "skip"
      : {
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
      document.title = `${inf.name} —  Pravixo`;
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

  const statCards = isBrand && brandDetails
    ? [
        { label: "Campaigns Posted", value: brandDetails.campaignsCount.toString() },
        { label: "Creators Hired", value: brandDetails.hiredCount.toString() },
        { label: "Active Campaigns", value: brandDetails.activeCampaignsCount.toString() },
        { label: "Success Rate", value: brandDetails.successRate },
      ]
    : [
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
      isVerified: verifiedConnections?.some((c: any) => c.platform === "instagram" && c.verified),
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
      isVerified: verifiedConnections?.some((c: any) => c.platform === "facebook" && c.verified),
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
      isVerified: verifiedConnections?.some((c: any) => c.platform === "linkedin" && c.verified),
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
      isVerified: verifiedConnections?.some((c: any) => c.platform === "youtube" && c.verified),
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
      isVerified: false,
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
      isVerified: verifiedConnections?.some((c: any) => c.platform === "twitter" && c.verified),
    },
  ].filter((item) => item.handle);

  return (
    <div>
      {/* COVER BANNER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[1361/450] overflow-hidden w-full rounded-b-2xl sm:rounded-b-3xl rounded-t-none shadow-sm border border-border/50">
          <img src={inf.cover} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* LINKEDIN-STYLE HEADER */}
        <div className="relative pb-8 border-b border-border/60 z-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            
            {/* Profile Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="-mt-14 sm:-mt-20 relative z-30 flex-shrink-0">
                <img
                  src={inf.avatar}
                  alt={inf.name}
                  className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-background object-cover shadow-elevated bg-background"
                />
              </div>
              
              <div className="pb-2 space-y-2">
                {/* Brand/Creator Name & Verified Badge inline */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {inf.name}
                  </h1>
                  {inf.verificationStatus === "verified" && (
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full gradient-sunset shadow-md">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </div>
                
                {/* Username / Handle */}
                <p className="text-sm font-semibold text-muted-foreground tracking-wide">
                  {inf.handle}
                </p>
                
                {/* Location, Category, Rating hierarchy */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1.5 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary hover:bg-secondary">
                    {inf.category}
                  </Badge>
                  <span className="text-border hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground/80" /> {inf.location}
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5 font-bold text-amber">
                    <Star className="h-4 w-4 fill-current" /> {rating} 
                    <span className="text-muted-foreground font-medium text-xs">({reviewsCount} reviews)</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* CTA Actions aligned to the right */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-2.5 self-center sm:self-end">
              {myProfile?.role === "brand" && (
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full transition-colors h-9 w-9 ${isFav
                    ? "border-red-500 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
                    : ""
                    }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart
                    className={`h-4 w-4 ${isFav ? "fill-current text-red-500" : ""}`}
                  />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9"
                onClick={() => toast("Link copied")}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {myProfile?.role === "brand" && (
                <Button
                  className="rounded-full gradient-sunset border-0 text-white shadow-glow px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                  onClick={handleHire}
                >
                  <MessageCircle className="h-4 w-4" /> Hire {inf.name.split(" ")[0]}
                </Button>
              )}
              {myProfile?.role === "creator" && inf.role === "brand" && (
                <>
                  {connectionStatus?.status === "accepted" ? (
                    <Button
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 border-0 text-white shadow-glow px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                      onClick={() => navigate("/messages")}
                    >
                      <MessageCircle className="h-4 w-4" /> Message Brand
                    </Button>
                  ) : connectionStatus?.status === "pending" ? (
                    <Button
                      className="rounded-full bg-secondary text-muted-foreground border border-border px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                      disabled
                    >
                      <Clock className="h-4 w-4" /> Pending Connection
                    </Button>
                  ) : connectionStatus?.status === "rejected" ? (
                    <Button
                      className="rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                      disabled
                    >
                      Connection Declined
                    </Button>
                  ) : (
                    <Button
                      className="rounded-full gradient-sunset border-0 text-white shadow-glow px-5 h-9 flex items-center gap-1.5 text-xs font-semibold"
                      onClick={() => setIsConnectionModalOpen(true)}
                    >
                      <UserPlus className="h-4 w-4" /> Connect With Brand
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="rounded-full px-5 h-9 flex items-center gap-1.5 text-xs font-semibold border-border hover:bg-secondary transition-colors"
                    onClick={() => {
                      const el = document.getElementById("open-campaigns");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Apply for Campaign
                  </Button>
                </>
              )}
              {canSubmitReview && myProfile?.role === "brand" && (
                <Button
                  variant="outline"
                  className="rounded-full px-5 h-9 flex items-center gap-1.5 hover:bg-secondary transition-colors text-xs font-semibold"
                  onClick={() => setIsReviewModalOpen(true)}
                >
                  <Star className="h-4 w-4 fill-amber text-amber" />
                  Rate Creator
                </Button>
              )}
            </div>
            
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

            {isBrand && brandDetails ? (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Company Size</div>
                    <div className="font-display text-base font-bold text-foreground mt-0.5">{brandDetails.companySize}</div>
                  </div>
                </div>
                <div className="flex h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Website</div>
                    <a
                      href={brandDetails.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-display text-sm font-bold text-primary hover:underline mt-0.5 block truncate max-w-[200px]"
                    >
                      {brandDetails.website.replace("https://", "")}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              socialCards.length > 0 && (
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
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                          <Icon
                            className={`h-5 w-5 transition-transform group-hover:scale-110 ${social.iconClass}`}
                          />
                          {social.isVerified && (
                            <span title="OAuth Verified" className="inline-flex items-center">
                              <ShieldCheck className="h-4 w-4 text-primary fill-primary/10 shrink-0" />
                            </span>
                          )}
                        </div>
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
              )
            )}

            <div className="grid gap-8 lg:grid-cols-2 items-stretch">
              {/* ABOUT */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
                <section className="flex-1 flex flex-col h-full">
                  <h2 className="font-display text-xl font-semibold">
                    {isBrand ? "About Brand" : "About"}
                  </h2>
                  <div className="mt-3 max-h-48 overflow-y-auto pr-2 flex-1">
                    <p className="text-muted-foreground">{inf.bio || (isBrand ? "Brand details on Pravixo." : "Creator on Pravixo.")}</p>
                  </div>
                </section>
              </div>

              {/* PORTFOLIO */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
                <section className="flex-1 flex flex-col h-full">
                  <h2 className="font-display text-xl font-semibold">
                    {isBrand ? "Brand Gallery" : "Portfolio"}
                  </h2>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {(isBrand && brandDetails ? brandDetails.gallery : portfolio).map((src, i) => (
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

            {/* OPEN CAMPAIGNS */}
            {isBrand && brandDetails && (
              <div id="open-campaigns" className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-display text-xl font-semibold">Open Campaigns</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Explore active collaboration opportunities and send proposals directly.
                  </p>
                </div>

                <div className="space-y-4">
                  {brandDetails.campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-4 bg-secondary/20 hover:bg-secondary/30 transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <h3 className="font-display text-sm font-bold text-foreground">
                          {camp.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-medium text-gradient-sunset">{camp.budget}</span>
                          <span>·</span>
                          <span>{camp.category}</span>
                          <span>·</span>
                          <span>{camp.duration}</span>
                          <span>·</span>
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-semibold">
                            {camp.applications} applicants
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full gradient-sunset border-0 text-white shadow-glow px-4"
                        onClick={() => {
                          toast.success(`Proposal sent for "${camp.title}"!`);
                        }}
                      >
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS & FEEDBACK */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-xl font-semibold">Reviews & Feedback</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBrand
                      ? `What creators are saying about collaborating with ${inf.name}`
                      : `What brands are saying about collaborating with ${inf.name}`}
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

          {/* PRICING or HIRING PREFERENCES */}
          <aside className="space-y-4">
            {isBrand && brandDetails ? (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  Hiring Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Preferred Niches
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">
                      {brandDetails.preferences.niches}
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Target Creator Reach
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">
                      {brandDetails.preferences.reach}
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Preferred Region
                    </div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">
                      {brandDetails.preferences.region}
                    </div>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
                      Campaign Budget Range
                    </div>
                    <div className="text-sm font-semibold text-gradient-sunset mt-0.5">
                      {brandDetails.preferences.budgetRange}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  Pricing Packages
                </h3>
                <div className="space-y-4">
                  {displayTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`rounded-2xl border p-4 relative transition-all duration-200 hover:border-muted-foreground/30 ${
                        tier.popular
                          ? "border-primary/50 bg-primary/5 shadow-sm"
                          : "border-border bg-background"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 right-4 rounded-full gradient-sunset px-2 py-0.5 text-[9px] font-semibold text-white shadow-sm">
                          Popular
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-xs font-bold text-foreground">
                          {tier.name}
                        </h4>
                        <span className="font-display text-sm font-bold text-gradient-sunset">
                          {formatINR(tier.price)}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {tier.perks.map((perk, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      <Dialog open={isConnectionModalOpen} onOpenChange={setIsConnectionModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">Connect with {inf.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send a personalized pitch message to introduce yourself and propose a collaboration. Once accepted, you can chat with the brand directly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendConnection} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="pitch-text" className="text-xs font-semibold text-muted-foreground">
                Your Pitch / Collaboration Message
              </Label>
              <Textarea
                id="pitch-text"
                required
                rows={5}
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                placeholder="Hi! I love your brand and would love to collaborate on a campaign. My engagement rate is..."
                className="rounded-xl border-border bg-background resize-none"
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setIsConnectionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendingRequest}
                className="rounded-full flex-1 gradient-sunset border-0 text-white shadow-glow"
              >
                {sendingRequest ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
