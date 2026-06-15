import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Bookmark,
  Clock,
  Filter,
  Heart,
  Search,
  Trash2,
  History,
  Save,
  Edit2,
  UserPlus,
  Check,
  X,
  Camera,
  ImageIcon,
  Upload,
  Plus,
  Star,
  Globe,
  Users,
  Building2,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const QuoraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);
import { Badge } from "@/components/ui/badge";
import {
  formatFollowers,
  influencers,
  CATEGORY_OPTIONS,
} from "@/data/influencers";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { Id } from "../../convex/_generated/dataModel";

const LOCATION_OPTIONS = [
  "Pan India",
  "Delhi NCR",
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Noida",
  "Gurugram",
  "Goa",
  "Kochi",
  "Other Location",
];

const COMPANY_SIZE_OPTIONS = [
  "1 - 10 employees",
  "11 - 50 employees",
  "50 - 200 employees",
  "200 - 500 employees",
  "500 - 1,000 employees",
  "1,000 - 5,000 employees",
  "5,000 - 10,000 employees",
  "10,000+ employees",
];

export function CustomerDash() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();

  const fileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Queries
  const conversations = useQuery(
    api.messages.getConversations,
    profile ? { profileId: profile._id, role: profile.role } : "skip",
  );

  const pendingRequests = useQuery(
    api.connections.getRequestsForBrand,
    profile ? { brandId: profile._id } : "skip",
  );

  const portfolioImages = useQuery(
    api.portfolio.getByProfile,
    profile ? { profileId: profile._id } : "skip",
  );

  const campaigns = useQuery(
    api.campaigns.getByBrand,
    profile ? { brandId: profile._id } : "skip",
  );

  const reviews = useQuery(
    api.reviews.listReviewsForCreator,
    profile ? { creatorId: profile._id, visibleOnly: false } : "skip",
  );

  const favsQuery = useQuery(
    api.profiles.getFavorites,
    profile ? { brandId: profile._id } : "skip",
  );

  // Mutations
  const updateProfile = useMutation(api.profiles.update);
  const acceptConnection = useMutation(api.connections.acceptRequest);
  const rejectConnection = useMutation(api.connections.rejectRequest);
  const toggleFavorite = useMutation(api.profiles.toggleFavorite);
  const generateUploadUrl = useMutation(api.portfolio.generateUploadUrl);
  const addPortfolioImage = useMutation(api.portfolio.addImage);
  const removePortfolioImage = useMutation(api.portfolio.removeImage);
  const setAvatarImage = useMutation(api.profiles.setAvatarImage);
  const setCoverImage = useMutation(api.profiles.setCoverImage);
  const toggleVisibility = useMutation(api.reviews.toggleReviewVisibility);

  // Campaigns Mutations
  const createCampaign = useMutation(api.campaigns.create);
  const updateCampaign = useMutation(api.campaigns.update);
  const removeCampaign = useMutation(api.campaigns.remove);

  // State variables for profile form
  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");

  // Social states
  const [instaHandle, setInstaHandle] = useState("");
  const [instaFollowers, setInstaFollowers] = useState<number>(0);
  const [fbHandle, setFbHandle] = useState("");
  const [fbFollowers, setFbFollowers] = useState<number>(0);
  const [liHandle, setLiHandle] = useState("");
  const [liFollowers, setLiFollowers] = useState<number>(0);
  const [ytHandle, setYtHandle] = useState("");
  const [ytFollowers, setYtFollowers] = useState<number>(0);
  const [quoraHandle, setQuoraHandle] = useState("");
  const [quoraFollowers, setQuoraFollowers] = useState<number>(0);
  const [twHandle, setTwHandle] = useState("");
  const [twFollowers, setTwFollowers] = useState<number>(0);

  // State for preferences
  const [niches, setNiches] = useState("");
  const [budget, setBudget] = useState("");
  const [reach, setReach] = useState("");
  const [regions, setRegions] = useState("");

  // Loading / Action states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Campaign Modal / Form states
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campTitle, setCampTitle] = useState("");
  const [campBudget, setCampBudget] = useState("");
  const [campCategory, setCampCategory] = useState("");
  const [campDuration, setCampDuration] = useState("");
  const [campActive, setCampActive] = useState(true);
  const [savingCampaign, setSavingCampaign] = useState(false);

  useEffect(() => {
    document.title = "Brand dashboard — Lumen";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setHandle(profile.handle || "");
      setCategory(profile.category || "");
      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setWebsite(profile.website || "");
      setCompanySize(profile.companySize || "");

      // Socials
      setInstaHandle(profile.instagramHandle || "");
      setInstaFollowers(profile.instagramFollowers || 0);
      setFbHandle(profile.facebookHandle || "");
      setFbFollowers(profile.facebookFollowers || 0);
      setLiHandle(profile.linkedinHandle || "");
      setLiFollowers(profile.linkedinFollowers || 0);
      setYtHandle(profile.youtubeHandle || "");
      setYtFollowers(profile.youtubeFollowers || 0);
      setQuoraHandle(profile.quoraHandle || "");
      setQuoraFollowers(profile.quoraFollowers || 0);
      setTwHandle(profile.twitterHandle || "");
      setTwFollowers(profile.twitterFollowers || 0);

      // Preferences
      setNiches(profile.prefNiches || "");
      setBudget(profile.prefBudget || "");
      setReach(profile.prefReach || "");
      setRegions(profile.prefRegions || "");
    }
  }, [profile]);

  // Handle category and location lists
  const selectedCategories = category
    ? category
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectCategory = (val: string) => {
    let updated: string[];
    if (selectedCategories.includes(val)) {
      updated = selectedCategories.filter((c) => c !== val);
    } else {
      updated = [...selectedCategories, val];
    }
    setCategory(updated.join(", "));
  };

  const selectedLocations = location
    ? location
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleSelectLocation = (val: string) => {
    let updated: string[];
    if (selectedLocations.includes(val)) {
      updated = selectedLocations.filter((c) => c !== val);
    } else {
      updated = [...selectedLocations, val];
    }
    setLocation(updated.join(", "));
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    try {
      await updateProfile({
        id: profile._id,
        fullName,
        handle: handle || undefined,
        category: category || undefined,
        location: location || undefined,
        bio: bio || undefined,
        website: website || undefined,
        companySize: companySize || undefined,
        // Socials
        instagramHandle: instaHandle || undefined,
        instagramFollowers: instaFollowers,
        facebookHandle: fbHandle || undefined,
        facebookFollowers: fbFollowers,
        linkedinHandle: liHandle || undefined,
        linkedinFollowers: liFollowers,
        youtubeHandle: ytHandle || undefined,
        youtubeFollowers: ytFollowers,
        quoraHandle: quoraHandle || undefined,
        quoraFollowers: quoraFollowers,
        twitterHandle: twHandle || undefined,
        twitterFollowers: twFollowers,
      });
      toast.success("Brand profile updated successfully!");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Preferences Save
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingPrefs(true);
    try {
      await updateProfile({
        id: profile._id,
        prefNiches: niches,
        prefBudget: budget,
        prefReach: reach,
        prefRegions: regions,
      });
      toast.success("Hiring preferences updated successfully!");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  // Image uploads (Avatar, Cover, Portfolio)
  const onAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await setAvatarImage({ id: profile._id, imageStorageId: storageId });
      toast.success("Brand logo updated!");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setUploadingAvatar(false);
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const onCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];

    // Validate image dimensions (1361x450 max)
    const isImageValid = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width > 1361 || img.height > 450) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });

    if (!isImageValid) {
      toast.error("Banner size must be 1361x450 pixels or smaller.");
      if (coverFileRef.current) coverFileRef.current.value = "";
      return;
    }

    setUploadingCover(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await setCoverImage({ id: profile._id, imageStorageId: storageId });
      toast.success("Cover banner updated!");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  const onGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploadingGallery(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await addPortfolioImage({
        profileId: profile._id,
        imageStorageId: storageId,
        sortOrder: portfolioImages?.length || 0,
      });
      toast.success("Gallery image uploaded!");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setUploadingGallery(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemoveGalleryImage = async (id: Id<"portfolioImages">) => {
    try {
      await removePortfolioImage({ id });
      toast.success("Gallery image removed");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    }
  };

  // Campaigns Handlers
  const openAddCampaignModal = () => {
    setEditingCampaign(null);
    setCampTitle("");
    setCampBudget("");
    setCampCategory("");
    setCampDuration("");
    setCampActive(true);
    setIsCampaignModalOpen(true);
  };

  const openEditCampaignModal = (camp: any) => {
    setEditingCampaign(camp);
    setCampTitle(camp.title);
    setCampBudget(camp.budget);
    setCampCategory(camp.category);
    setCampDuration(camp.duration);
    setCampActive(camp.active);
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingCampaign(true);
    try {
      if (editingCampaign) {
        await updateCampaign({
          id: editingCampaign._id,
          title: campTitle,
          budget: campBudget,
          category: campCategory,
          duration: campDuration,
          active: campActive,
        });
        toast.success("Campaign updated successfully!");
      } else {
        await createCampaign({
          brandId: profile._id,
          title: campTitle,
          budget: campBudget,
          category: campCategory,
          duration: campDuration,
          active: campActive,
        });
        toast.success("Campaign created successfully!");
      }
      setIsCampaignModalOpen(false);
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to save campaign");
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleDeleteCampaign = async (id: Id<"campaigns">) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await removeCampaign({ id });
      toast.success("Campaign deleted");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to delete campaign");
    }
  };

  // Reviews Toggles
  const handleToggleVisibility = async (reviewId: Id<"reviews">) => {
    if (!profile) return;
    try {
      const res = await toggleVisibility({
        reviewId,
        creatorId: profile._id,
      });
      if (res.visible) {
        toast.success("Review is now visible on your brand profile");
      } else {
        toast.info("Review is now hidden from your brand profile");
      }
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to update visibility");
    }
  };

  const saved = useMemo(() => {
    if (!favsQuery) return [];
    return favsQuery
      .map((fav) => {
        if (fav.isLive) {
          return {
            id: fav.id,
            name: fav.name,
            avatar: fav.avatar,
            category: fav.category,
            followers: fav.followers,
          };
        } else {
          const staticInf = influencers.find((i) => i.id === fav.id);
          return staticInf
            ? {
                id: staticInf.id,
                name: staticInf.name,
                avatar: staticInf.avatar,
                category: staticInf.category,
                followers: staticInf.followers,
              }
            : null;
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [favsQuery]);

  const handleRemoveFavorite = async (creatorId: string) => {
    if (!profile) return;
    try {
      await toggleFavorite({ brandId: profile._id, creatorId });
      toast.success("Removed from favorites");
    } catch (e) {
      toast.error("Failed to remove from favorites");
    }
  };

  const stats = useMemo(() => {
    const totalCamps = campaigns?.length || 0;
    const activeCamps = campaigns?.filter((c: any) => c.active).length || 0;
    const hiredCount =
      conversations?.filter(
        (c: any) => c.status === "completed" || c.status === "active",
      ).length || 0;
    return [
      { label: "Campaigns Posted", value: totalCamps.toString() },
      { label: "Creators Hired", value: hiredCount.toString() },
      { label: "Active Campaigns", value: activeCamps.toString() },
      { label: "Success Rate", value: "98%" },
    ];
  }, [campaigns, conversations]);

  const recent = [
    "fashion creators in Mumbai",
    "fitness reels under ₹40,000",
    "tech reviewers 1M+",
    "food bloggers Delhi",
  ];

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "";

  return (
    <div>
      {/* COVER BANNER PREVIEW */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative h-64 overflow-hidden bg-muted sm:h-80 rounded-b-2xl sm:rounded-b-3xl rounded-t-none shadow-sm border border-border/50">
          {profile?.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Banner Preview
            </div>
          )}
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 relative z-30">
        {/* LOGO & BRAND DETAILS HEADER */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="-mt-14 sm:-mt-20 relative z-40 flex-shrink-0">
              <img
                src={
                  profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.fullName || "brand"}`
                }
                alt=""
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-background object-cover bg-background shadow-elevated"
              />
            </div>
            <div className="pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
                  {fullName || "Company Name"}
                </h1>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-sunset shadow-sm">
                  <Check className="h-3 w-3 text-white" />
                </span>
              </div>
              <p className="text-lg font-medium text-muted-foreground/90">
                {handle ? `@${handle.replace("@", "")}` : "@handle"}
              </p>
              {profile && (
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <Badge variant="secondary" className="rounded-full">
                    {category || "N/A"}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> {companySize || "N/A"}
                  </span>
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />{" "}
                      {website.replace(/https?:\/\/(www\.)?/, "")}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/influencer/${profile?._id}`}>
              <Button
                variant="outline"
                className="rounded-full text-xs font-semibold px-5"
              >
                View Public Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* CONNECTION REQUESTS AT TOP */}
        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Pending Connection Requests ({pendingRequests.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border p-4 bg-secondary/10 hover:bg-secondary/20 transition-all duration-200"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      src={
                        req.creatorProfile?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${req.creatorProfile?.fullName}`
                      }
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover aspect-square border border-border/50 shadow-sm flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/influencer/${req.creatorId}`}
                          className="font-display text-sm font-semibold hover:text-primary truncate"
                        >
                          {req.creatorProfile?.fullName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {req.creatorProfile?.category || "Creator"} ·{" "}
                        {req.creatorProfile?.location || "India"}
                      </p>
                      <p className="text-xs text-muted-foreground/95 bg-background border border-border/40 rounded-xl p-2.5 mt-2 italic line-clamp-3">
                        "{req.pitch}"
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 self-stretch sm:justify-center">
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-initial rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-4 h-9 flex items-center justify-center gap-1.5"
                      onClick={async () => {
                        try {
                          await acceptConnection({ connectionId: req._id });
                          toast.success(
                            `Connected with ${req.creatorProfile?.fullName}!`,
                          );
                        } catch (err) {
                          toast.error("Failed to accept request");
                        }
                      }}
                    >
                      <Check className="h-4 w-4" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-initial rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 px-4 h-9 flex items-center justify-center gap-1.5"
                      onClick={async () => {
                        try {
                          await rejectConnection({ connectionId: req._id });
                          toast.success("Request declined");
                        } catch (err) {
                          toast.error("Failed to decline request");
                        }
                      }}
                    >
                      <X className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN DUAL COLUMN CONTENT */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] items-start">
          {/* LEFT COLUMN: EDIT SECTIONS */}
          <div className="space-y-6">
            {/* STATS PREVIEW CARDS */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex h-28 flex-col items-center justify-center rounded-3xl border border-border bg-card p-4 text-center shadow-sm"
                >
                  <div className="font-display text-2xl font-bold text-foreground">
                    {s.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* BRAND PROFILE FORM */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold mb-5 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Edit Brand
                Details
              </h2>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={
                      profile?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.fullName || user?.email || "brand"}`
                    }
                    alt=""
                    className="h-20 w-20 rounded-full border border-border object-cover bg-muted"
                  />
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                      <Camera className="h-4 w-4" />
                      {uploadingAvatar ? "Uploading..." : "Upload logo"}
                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                      <ImageIcon className="h-4 w-4" />
                      {uploadingCover ? "Uploading..." : "Upload banner"}
                      <input
                        ref={coverFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onCoverUpload}
                        disabled={uploadingCover}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Company Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Nike India"
                      className="mt-1.5 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="handle">Handle</Label>
                    <Input
                      id="handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="e.g., nikeindia"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>

                  {/* CATEGORY & LOCATION POPOVER SELECTORS */}
                  <div className="flex flex-col gap-1.5">
                    <Label>Industry Category</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left mt-1.5 cursor-pointer"
                        >
                          <div className="flex flex-wrap gap-1">
                            {selectedCategories.length === 0 ? (
                              <span className="text-muted-foreground">
                                Select categories...
                              </span>
                            ) : (
                              selectedCategories.map((cat) => (
                                <Badge
                                  key={cat}
                                  variant="secondary"
                                  className="rounded-sm px-1.5 py-0.5 font-normal text-xs flex items-center gap-1"
                                >
                                  {cat}
                                  <span
                                    role="button"
                                    className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectCategory(cat);
                                    }}
                                  >
                                    <X className="h-3 w-3 text-muted-foreground" />
                                  </span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search categories..."
                            className="h-9"
                          />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {CATEGORY_OPTIONS.map((cat) => {
                                const isSelected =
                                  selectedCategories.includes(cat);
                                return (
                                  <CommandItem
                                    key={cat}
                                    onSelect={() => handleSelectCategory(cat)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div
                                      className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isSelected
                                          ? "bg-primary text-primary-foreground"
                                          : "opacity-50",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </div>
                                    {cat}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>HQ Location</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex min-h-[2.5rem] w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left mt-1.5 cursor-pointer"
                        >
                          <div className="flex flex-wrap gap-1">
                            {selectedLocations.length === 0 ? (
                              <span className="text-muted-foreground">
                                Select locations...
                              </span>
                            ) : (
                              selectedLocations.map((loc) => (
                                <Badge
                                  key={loc}
                                  variant="secondary"
                                  className="rounded-sm px-1.5 py-0.5 font-normal text-xs flex items-center gap-1"
                                >
                                  {loc}
                                  <span
                                    role="button"
                                    className="rounded-full p-0.5 hover:bg-muted cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectLocation(loc);
                                    }}
                                  >
                                    <X className="h-3 w-3 text-muted-foreground" />
                                  </span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search locations..."
                            className="h-9"
                          />
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            <CommandEmpty>No location found.</CommandEmpty>
                            <CommandGroup>
                              {LOCATION_OPTIONS.map((loc) => {
                                const isSelected =
                                  selectedLocations.includes(loc);
                                return (
                                  <CommandItem
                                    key={loc}
                                    onSelect={() => handleSelectLocation(loc)}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <div
                                      className={cn(
                                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        isSelected
                                          ? "bg-primary text-primary-foreground"
                                          : "opacity-50",
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="h-3 w-3" />
                                      )}
                                    </div>
                                    {loc}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="website">Website Link</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g., https://www.nike.com/in"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <select
                      id="companySize"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring mt-1.5 rounded-xl cursor-pointer"
                    >
                      <option value="">Select size...</option>
                      {COMPANY_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">About Brand</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Provide a detailed description of your brand, values, and products..."
                    className="mt-1.5 rounded-xl resize-none"
                    rows={4}
                  />
                </div>

                <div className="pt-4 border-t border-border/40">
                  <h3 className="font-display text-base font-semibold">
                    Social Presence
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Update your company's social handles and follower counts
                    manually.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <span className="text-sm font-semibold">Instagram</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={instaHandle}
                          onChange={(e) => setInstaHandle(e.target.value)}
                          placeholder="@username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={instaFollowers}
                          onChange={(e) =>
                            setInstaFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold">Facebook</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={fbHandle}
                          onChange={(e) => setFbHandle(e.target.value)}
                          placeholder="username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={fbFollowers}
                          onChange={(e) =>
                            setFbFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-blue-800" />
                        <span className="text-sm font-semibold">LinkedIn</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={liHandle}
                          onChange={(e) => setLiHandle(e.target.value)}
                          placeholder="in/username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={liFollowers}
                          onChange={(e) =>
                            setLiFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold">YouTube</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={ytHandle}
                          onChange={(e) => setYtHandle(e.target.value)}
                          placeholder="@username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={ytFollowers}
                          onChange={(e) =>
                            setYtFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <QuoraIcon className="h-4 w-4 text-red-700" />
                        <span className="text-sm font-semibold">Quora</span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={quoraHandle}
                          onChange={(e) => setQuoraHandle(e.target.value)}
                          placeholder="username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={quoraFollowers}
                          onChange={(e) =>
                            setQuoraFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/10">
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-semibold">
                          X / Twitter
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Handle
                        </Label>
                        <Input
                          value={twHandle}
                          onChange={(e) => setTwHandle(e.target.value)}
                          placeholder="@username"
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Followers
                        </Label>
                        <Input
                          type="number"
                          value={twFollowers}
                          onChange={(e) =>
                            setTwFollowers(Number(e.target.value))
                          }
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-full gradient-sunset border-0 text-white shadow-glow px-6"
                  >
                    {savingProfile ? "Saving Details..." : "Save Details"}
                  </Button>
                </div>
              </form>
            </div>

            {/* BRAND GALLERY */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold mb-2">
                Brand Gallery
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Showcase products, campaign banners, teams, or advertisements.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {portfolioImages?.map((img) => (
                  <div
                    key={img._id}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-border"
                  >
                    {img.url && (
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(img._id)}
                      className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary">
                  <Upload className="h-5 w-5" />
                  {uploadingGallery ? "Uploading…" : "Add Image"}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onGalleryUpload}
                    disabled={uploadingGallery}
                  />
                </label>
              </div>
            </div>

            {/* OPEN CAMPAIGNS */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Open Campaigns
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Create and manage active campaign listings visible to
                    creators.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full gradient-sunset border-0 text-white shadow-glow px-4 h-9 flex items-center gap-1.5"
                  onClick={openAddCampaignModal}
                >
                  <Plus className="h-4 w-4" /> Add Campaign
                </Button>
              </div>

              {!campaigns ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                  <p className="font-display font-semibold text-sm">
                    No campaigns listed yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[280px]">
                    Add campaign listings to invite pitches and applications
                    from top creators.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 rounded-full"
                    onClick={openAddCampaignModal}
                  >
                    Create your first campaign
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {campaigns.map((camp: any) => (
                    <div
                      key={camp._id}
                      className="rounded-2xl border border-border p-4 bg-background hover:bg-accent/5 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">
                            {camp.title}
                          </h4>
                          <Badge
                            variant={camp.active ? "default" : "secondary"}
                            className="rounded-full text-[9px] px-2 py-0"
                          >
                            {camp.active ? "Active" : "Draft"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span className="font-semibold text-gradient-sunset">
                            {camp.budget}
                          </span>
                          <span>·</span>
                          <span>{camp.duration}</span>
                          <span>·</span>
                          <span>{camp.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-border/40 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full text-xs hover:bg-secondary px-3 flex items-center gap-1.5"
                          onClick={() => openEditCampaignModal(camp)}
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive px-3 flex items-center gap-1.5"
                          onClick={() => handleDeleteCampaign(camp._id)}
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* REVIEWS VISIBILITY SETTINGS */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold mb-2">
                Reviews from Creators
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Toggle display visibility of feedback and ratings left by
                creators.
              </p>

              {!reviews ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-xl">
                  <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="font-semibold text-sm text-muted-foreground">
                    No creator reviews received yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reviews from completed creator collaborations will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border rounded-2xl p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <img
                            src={
                              review.brandAvatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${review.brandName}`
                            }
                            alt=""
                            className="h-8 w-8 rounded-full object-cover border border-border shadow-sm aspect-square"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">
                                {review.brandName}
                              </h4>
                              {review.campaignRef && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] rounded-full"
                                >
                                  {review.campaignRef}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-2.5 w-2.5 ${
                                      star <= review.rating
                                        ? "fill-amber text-amber"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] text-muted-foreground">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <p className="font-semibold text-foreground">
                            {review.title}
                          </p>
                          <p className="text-muted-foreground mt-0.5">
                            {review.text}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center pt-2 md:pt-0 w-full md:w-auto justify-between border-t md:border-t-0 border-border/40">
                        <div className="text-left md:text-right">
                          <span className="block text-xs font-semibold text-foreground">
                            Public Display
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {review.visible
                              ? "Shown on profile"
                              : "Hidden from profile"}
                          </span>
                        </div>
                        <Switch
                          checked={review.visible}
                          onCheckedChange={() =>
                            handleToggleVisibility(review._id)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR */}
          <div className="space-y-6">
            {/* HIRING PREFERENCES PANEL */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" /> Hiring Preferences
              </h2>
              <form
                onSubmit={handleSavePreferences}
                className="space-y-4 text-sm"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefNiches"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Target Niches
                  </Label>
                  <Input
                    id="prefNiches"
                    value={niches}
                    onChange={(e) => setNiches(e.target.value)}
                    placeholder="e.g. Sports, Fitness, Running"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefBudget"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Campaign Budget Range
                  </Label>
                  <Input
                    id="prefBudget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. ₹20K - ₹100K per post"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefReach"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Target Creator Reach
                  </Label>
                  <Input
                    id="prefReach"
                    value={reach}
                    onChange={(e) => setReach(e.target.value)}
                    placeholder="e.g. 50K+ followers"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="prefRegions"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Preferred Regions
                  </Label>
                  <Input
                    id="prefRegions"
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                    placeholder="e.g. India (Metros)"
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={savingPrefs}
                  className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow mt-4"
                >
                  <Save className="mr-1.5 h-4 w-4" />{" "}
                  {savingPrefs
                    ? "Updating Preferences..."
                    : "Update Preferences"}
                </Button>
              </form>
            </div>

            {/* SAVED CREATORS (KEPT FROM ORIGINAL) */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-base font-semibold">
                    Saved Creators
                  </h2>
                </div>
                <Link
                  to="/browse"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Browse
                </Link>
              </div>

              {saved.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No saved creators yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {saved.map((inf) => (
                    <div
                      key={inf.id}
                      className="flex items-center gap-3 rounded-2xl border border-border p-3"
                    >
                      <img
                        src={inf.avatar}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover aspect-square flex-shrink-0 border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/influencer/${inf.id}`}
                          className="block truncate font-display text-xs font-semibold hover:text-primary"
                        >
                          {inf.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">
                          {inf.category} · {formatFollowers(inf.followers || 0)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(inf.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HIRING HISTORY (KEPT FROM ORIGINAL) */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="font-display text-base font-semibold">
                  Collaboration History
                </h2>
              </div>

              {!conversations || conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                  <p className="text-xs font-medium text-muted-foreground">
                    No collaborations initiated
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((c) => {
                    const creator = c.otherProfile;
                    if (!creator) return null;
                    return (
                      <div
                        key={c._id}
                        className="flex items-center gap-3 rounded-2xl border border-border p-3"
                      >
                        <img
                          src={
                            creator.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${creator.fullName}`
                          }
                          alt=""
                          className="h-10 w-10 rounded-full object-cover aspect-square flex-shrink-0 border border-border"
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/influencer/${creator._id}`}
                            className="block truncate font-display text-xs font-semibold hover:text-primary"
                          >
                            {creator.fullName}
                          </Link>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {creator.category || "General"} ·{" "}
                            {creator.location || "India"}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[9px] capitalize rounded-full px-2"
                        >
                          {c.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RECENT SEARCHES */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-display text-base font-semibold">
                  Recent searches
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((q) => (
                  <Link key={q} to="/browse">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2.5 py-1 text-[10px] hover:bg-accent flex items-center gap-1"
                    >
                      <Search className="h-2.5 w-2.5" /> {q}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN DIALOG DIALOG (CREATE/EDIT) */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingCampaign ? "Edit Campaign" : "Add Campaign"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the collaboration campaign specifics for creators to view
              and apply.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCampaign} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="campTitle">Campaign Title</Label>
              <Input
                id="campTitle"
                value={campTitle}
                onChange={(e) => setCampTitle(e.target.value)}
                placeholder="e.g. Summer Sports Reels Series"
                className="rounded-xl border-border bg-background"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="campBudget">Budget Range</Label>
                <Input
                  id="campBudget"
                  value={campBudget}
                  onChange={(e) => setCampBudget(e.target.value)}
                  placeholder="e.g. ₹50,000 - ₹1,00,000"
                  className="rounded-xl border-border bg-background"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campDuration">Duration</Label>
                <Input
                  id="campDuration"
                  value={campDuration}
                  onChange={(e) => setCampDuration(e.target.value)}
                  placeholder="e.g. 3 weeks"
                  className="rounded-xl border-border bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campCategory">Campaign Category</Label>
              <Input
                id="campCategory"
                value={campCategory}
                onChange={(e) => setCampCategory(e.target.value)}
                placeholder="e.g. Sports & Fitness"
                className="rounded-xl border-border bg-background"
                required
              />
            </div>

            <div className="flex items-center justify-between border border-border rounded-2xl p-4 bg-background/50">
              <div>
                <Label className="text-sm font-semibold">Active Status</Label>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  If active, creators can search and apply for this campaign.
                </span>
              </div>
              <Switch checked={campActive} onCheckedChange={setCampActive} />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => setIsCampaignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingCampaign}
                className="rounded-full flex-1 gradient-sunset border-0 text-white shadow-glow"
              >
                {savingCampaign
                  ? "Saving..."
                  : editingCampaign
                    ? "Save Changes"
                    : "Create Listing"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
