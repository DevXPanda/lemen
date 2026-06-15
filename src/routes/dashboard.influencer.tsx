import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Upload,
  Plus,
  Trash2,
  Instagram,
  Facebook,
  Linkedin,
  Camera,
  ImageIcon,
  Youtube,
  Twitter,
  Check,
  ChevronsUpDown,
  X,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_OPTIONS } from "@/data/influencers";
import { Switch } from "@/components/ui/switch";

const QuoraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.592 16.483c.783-.984 1.258-2.228 1.258-3.585 0-3.155-2.558-5.713-5.713-5.713S6.423 9.743 6.423 12.898s2.558 5.713 5.713 5.713c1.088 0 2.106-.305 2.975-.833l3.208 3.208c.28.28.73.28 1.01 0a.715.715 0 000-1.01l-2.737-2.493zm-4.455.518c-2.099 0-3.8-1.701-3.8-3.8 0-2.099 1.701-3.8 3.8-3.8s3.8 1.701 3.8 3.8c0 2.099-1.701 3.8-3.8 3.8z" />
  </svg>
);

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
  "Surat",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Gurugram",
  "Faridabad",
  "Indore",
  "Bhopal",
  "Nagpur",
  "Nashik",
  "Patna",
  "Ranchi",
  "Chandigarh",
  "Ludhiana",
  "Amritsar",
  "Jalandhar",
  "Dehradun",
  "Haridwar",
  "Varanasi",
  "Agra",
  "Prayagraj",
  "Meerut",
  "Gorakhpur",
  "Kochi",
  "Thiruvananthapuram",
  "Kozhikode",
  "Coimbatore",
  "Madurai",
  "Visakhapatnam",
  "Vijayawada",
  "Bhubaneswar",
  "Cuttack",
  "Guwahati",
  "Siliguri",
  "Jodhpur",
  "Udaipur",
  "Kota",
  "Mysore",
  "Mangalore",
  "Other Location",
];

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/components/auth-provider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

type Tier = {
  id?: Id<"pricingTiers">;
  name: string;
  price: number;
  sortOrder: number;
};
type PortfolioItem = {
  _id: Id<"portfolioImages">;
  imageStorageId: string;
  url: string | null;
};

export function CreatorDash() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Queries
  const pricingTiers = useQuery(
    api.pricing.getByProfile,
    profile ? { profileId: profile._id } : "skip",
  );
  const portfolioImages = useQuery(
    api.portfolio.getByProfile,
    profile ? { profileId: profile._id } : "skip",
  );

  // Mutations
  const updateProfile = useMutation(api.profiles.update);
  const upsertPricing = useMutation(api.pricing.upsertMany);
  const removeTierMutation = useMutation(api.pricing.remove);
  const generateUploadUrl = useMutation(api.portfolio.generateUploadUrl);
  const addPortfolioImage = useMutation(api.portfolio.addImage);
  const removePortfolioImage = useMutation(api.portfolio.removeImage);
  const setAvatarImage = useMutation(api.profiles.setAvatarImage);
  const setCoverImage = useMutation(api.profiles.setCoverImage);

  // Reviews queries and mutations
  const reviews = useQuery(
    api.reviews.listReviewsForCreator,
    profile ? { creatorId: profile._id, visibleOnly: false } : "skip"
  );
  const toggleVisibility = useMutation(api.reviews.toggleReviewVisibility);

  const [fullName, setFullName] = useState("");
  const [handle, setHandle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [startingPrice, setStartingPrice] = useState<number>(0);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

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

  useEffect(() => {
    document.title = "Creator dashboard — Lumen";
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
      setStartingPrice(Number(profile.startingPrice ?? 0));
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
    }
  }, [profile]);

  useEffect(() => {
    if (pricingTiers && pricingTiers.length) {
      setTiers(
        pricingTiers.map((t) => ({
          id: t._id,
          name: t.name,
          price: t.price,
          sortOrder: t.sortOrder,
        })),
      );
    } else if (pricingTiers && pricingTiers.length === 0) {
      setTiers([
        { name: "Story", price: 0, sortOrder: 0 },
        { name: "Post", price: 0, sortOrder: 1 },
        { name: "Reel", price: 0, sortOrder: 2 },
      ]);
    }
  }, [pricingTiers]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({
        id: profile._id,
        fullName,
        handle: handle || undefined,
        category: category || undefined,
        location: location || undefined,
        bio: bio || undefined,
        startingPrice,
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
      toast.success("Profile saved");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const savePricing = async () => {
    if (!profile) return;
    try {
      await upsertPricing({
        profileId: profile._id,
        tiers: tiers.map((t, idx) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          sortOrder: idx,
        })),
      });
      toast.success("Pricing updated");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    }
  };

  const removeTier = async (idx: number) => {
    const t = tiers[idx];
    if (t.id) {
      try {
        await removeTierMutation({ id: t.id });
      } catch (err) {
        const e = err as Error;
        toast.error(e.message);
        return;
      }
    }
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
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

      toast.success("Image uploaded");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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

      await setAvatarImage({
        id: profile._id,
        imageStorageId: storageId,
      });

      toast.success("Profile photo updated");
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
    setUploadingCover(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      await setCoverImage({
        id: profile._id,
        imageStorageId: storageId,
      });

      toast.success("Banner updated");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    } finally {
      setUploadingCover(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  const removeImage = async (id: Id<"portfolioImages">) => {
    try {
      await removePortfolioImage({ id });
      toast.success("Image removed");
    } catch (err) {
      const e = err as Error;
      toast.error(e.message);
    }
  };

  const handleToggleVisibility = async (reviewId: Id<"reviews">) => {
    if (!profile) return;
    try {
      const res = await toggleVisibility({
        reviewId,
        creatorId: profile._id,
      });
      if (res.visible) {
        toast.success("Review is now visible on your public profile");
      } else {
        toast.info("Review is now hidden from your public profile");
      }
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to update review visibility");
    }
  };

  const displayName =
    fullName?.split(" ")[0] ||
    profile?.fullName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

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
              Banner preview
            </div>
          )}
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Creator dashboard</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Hello, {displayName} 👋
          </h1>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
          {[
            {
              icon: Eye,
              label: "Profile views",
              value: profile?.profileViews?.toLocaleString() || "0",
              // delta: "+18%",
            },
            {
              icon: MousePointerClick,
              label: "Clicks",
              value: profile?.clicks?.toLocaleString() || "0",
              // delta: "+9%",
            },
            {
              icon: TrendingUp,
              label: "Bookings",
              value: profile?.bookings?.toLocaleString() || "0",
              // delta: "+4",
            },
          ].map((s: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta?: string }, idx) => (
            <div
              key={s.label}
              className={cn(
                "rounded-3xl border border-border bg-card p-6",
                idx === 2 && "col-span-2 md:col-span-1"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                {s.delta && (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs text-emerald-600"
                  >
                    {s.delta}
                  </Badge>
                )}
              </div>
              <div className="mt-4 font-display text-3xl font-bold">
                {s.value}
              </div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3 items-start">
          <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold">Edit profile</h2>
            <div className="mt-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={
                    profile?.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.fullName || user?.email || "creator"}`
                  }
                  alt=""
                  className="h-20 w-20 rounded-full border border-border object-cover bg-muted"
                />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                    <Camera className="h-4 w-4" />
                    {uploadingAvatar ? "Uploading..." : "Upload profile photo"}
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
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Display name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Handle</Label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@yourname"
                  className="mt-1.5"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
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
                                tabIndex={0}
                                className="rounded-full outline-none hover:bg-muted p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCategory(cat);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    handleSelectCategory(cat);
                                  }
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search categories..."
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {CATEGORY_OPTIONS.map((cat) => {
                            const isSelected = selectedCategories.includes(cat);
                            return (
                              <CommandItem
                                key={cat}
                                value={cat}
                                onSelect={() => handleSelectCategory(cat)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{cat}</span>
                                </div>
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
                <Label>Location</Label>
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
                                tabIndex={0}
                                className="rounded-full outline-none hover:bg-muted p-0.5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectLocation(loc);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation();
                                    handleSelectLocation(loc);
                                  }
                                }}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </span>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command className="w-full">
                      <CommandInput
                        placeholder="Search locations..."
                        className="h-9"
                      />
                      <CommandList className="max-h-[300px] overflow-y-auto">
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          {LOCATION_OPTIONS.map((loc) => {
                            const isSelected = selectedLocations.includes(loc);
                            return (
                              <CommandItem
                                key={loc}
                                value={loc}
                                onSelect={() => handleSelectLocation(loc)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "opacity-50 [&_svg]:invisible",
                                    )}
                                  >
                                    <Check className="h-3 w-3" />
                                  </div>
                                  <span>{loc}</span>
                                </div>
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
                <Label>Starting price (₹)</Label>
                <Input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>

            <h3 className="mt-8 font-display text-base font-semibold">
              Social presence
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Update your social handles and follower counts manually.
            </p>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 rounded-2xl border border-border p-3 sm:p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">Instagram</span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Handle
                  </Label>
                  <Input
                    size={1}
                    value={instaHandle}
                    onChange={(e) => setInstaHandle(e.target.value)}
                    placeholder="@username"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Followers
                  </Label>
                  <Input
                    type="number"
                    value={instaFollowers}
                    onChange={(e) => setInstaFollowers(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border p-3 sm:p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">Facebook</span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Handle
                  </Label>
                  <Input
                    size={1}
                    value={fbHandle}
                    onChange={(e) => setFbHandle(e.target.value)}
                    placeholder="username"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Followers
                  </Label>
                  <Input
                    type="number"
                    value={fbFollowers}
                    onChange={(e) => setFbFollowers(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border p-3 sm:p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-blue-800" />
                  <span className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">LinkedIn</span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Handle
                  </Label>
                  <Input
                    size={1}
                    value={liHandle}
                    onChange={(e) => setLiHandle(e.target.value)}
                    placeholder="in/username"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Followers
                  </Label>
                  <Input
                    type="number"
                    value={liFollowers}
                    onChange={(e) => setLiFollowers(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border p-3 sm:p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">YouTube</span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Handle
                  </Label>
                  <Input
                    size={1}
                    value={ytHandle}
                    onChange={(e) => setYtHandle(e.target.value)}
                    placeholder="@username"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Followers
                  </Label>
                  <Input
                    type="number"
                    value={ytFollowers}
                    onChange={(e) => setYtFollowers(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border p-3 sm:p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <QuoraIcon className="h-4 w-4 text-red-700" />
                  <span className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">Quora</span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Handle
                  </Label>
                  <Input
                    size={1}
                    value={quoraHandle}
                    onChange={(e) => setQuoraHandle(e.target.value)}
                    placeholder="username"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Followers
                  </Label>
                  <Input
                    type="number"
                    value={quoraFollowers}
                    onChange={(e) => setQuoraFollowers(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border p-3 sm:p-4 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  <span className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap">X (Twitter)</span>
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Handle
                  </Label>
                  <Input
                    size={1}
                    value={twHandle}
                    onChange={(e) => setTwHandle(e.target.value)}
                    placeholder="@username"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Followers
                  </Label>
                  <Input
                    type="number"
                    value={twFollowers}
                    onChange={(e) => setTwFollowers(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <h3 className="mt-8 font-display text-base font-semibold">
              Portfolio
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                    onClick={() => removeImage(img._id)}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 opacity-0 shadow-soft transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-xs text-muted-foreground hover:bg-secondary">
                <Upload className="h-5 w-5" />
                {uploading ? "Uploading…" : "Upload"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Pricing</h2>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() =>
                  setTiers([
                    ...tiers,
                    { name: "New tier", price: 0, sortOrder: tiers.length },
                  ])
                }
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              {tiers.map((t, idx) => (
                <div key={idx} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      value={t.name}
                      onChange={(e) => {
                        const next = [...tiers];
                        next[idx] = { ...t, name: e.target.value };
                        setTiers(next);
                      }}
                      className="h-8 max-w-[60%] font-display font-semibold"
                    />
                    <span className="font-display font-bold">
                      {formatINR(t.price)}
                    </span>
                    <button
                      onClick={() => removeTier(idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    type="number"
                    value={t.price}
                    onChange={(e) => {
                      const next = [...tiers];
                      next[idx] = { ...t, price: Number(e.target.value) };
                      setTiers(next);
                    }}
                    className="mt-3"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={savePricing}
              variant="secondary"
              className="mt-5 w-full rounded-full"
            >
              Update pricing
            </Button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 rounded-3xl border border-border bg-card p-6">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold">Reviews & Feedback</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage reviews displayed on your public profile page.
            </p>
          </div>

          {!reviews ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-2xl">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-sm text-muted-foreground">No reviews received yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Reviews left by brands you collaborate with will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border rounded-2xl p-4 transition-colors hover:bg-accent/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <img
                        src={
                          review.brandAvatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${review.brandName}`
                        }
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border border-border/50 shadow-sm aspect-square"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-sm font-semibold text-foreground">
                            {review.brandName}
                          </h4>
                          {review.campaignRef && (
                            <Badge variant="secondary" className="text-[10px] rounded-full">
                              Campaign: {review.campaignRef}
                            </Badge>
                          )}
                        </div>
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

                    <div className="mt-3 pl-0 md:pl-13">
                      <h5 className="text-sm font-semibold text-foreground">
                        {review.title}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-start">
                    <div className="text-right">
                      <span className="block text-xs font-semibold text-foreground">
                        Public Display
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        {review.visible ? "Shown on public profile" : "Hidden from public"}
                      </span>
                    </div>
                    <Switch
                      checked={review.visible}
                      onCheckedChange={() => handleToggleVisibility(review._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
