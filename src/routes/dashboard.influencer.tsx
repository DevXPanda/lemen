import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Eye, MousePointerClick, TrendingUp, Upload, Plus, Trash2, Instagram, Facebook, Linkedin, Camera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/influencer")({
  head: () => ({ meta: [{ title: "Creator dashboard — Lumen" }] }),
  component: CreatorDash,
});

type Tier = { id?: Id<"pricingTiers">; name: string; price: number; sortOrder: number };
type PortfolioItem = { _id: Id<"portfolioImages">; imageStorageId: string; url: string | null };

function CreatorDash() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  // Queries
  const pricingTiers = useQuery(api.pricing.getByProfile, profile ? { profileId: profile._id } : "skip");
  const portfolioImages = useQuery(api.portfolio.getByProfile, profile ? { profileId: profile._id } : "skip");

  // Mutations
  const updateProfile = useMutation(api.profiles.update);
  const upsertPricing = useMutation(api.pricing.upsertMany);
  const removeTierMutation = useMutation(api.pricing.remove);
  const generateUploadUrl = useMutation(api.portfolio.generateUploadUrl);
  const addPortfolioImage = useMutation(api.portfolio.addImage);
  const removePortfolioImage = useMutation(api.portfolio.removeImage);
  const setAvatarImage = useMutation(api.profiles.setAvatarImage);
  const setCoverImage = useMutation(api.profiles.setCoverImage);

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

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
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
    }
  }, [profile]);

  useEffect(() => {
    if (pricingTiers && pricingTiers.length) {
      setTiers(pricingTiers.map(t => ({ id: t._id, name: t.name, price: t.price, sortOrder: t.sortOrder })));
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
      });
      toast.success("Profile saved");
    } catch (e: any) {
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
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const removeTier = async (idx: number) => {
    const t = tiers[idx];
    if (t.id) {
      try {
        await removeTierMutation({ id: t.id });
      } catch (e: any) {
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
        sortOrder: (portfolioImages?.length || 0),
      });

      toast.success("Image uploaded");
    } catch (e: any) {
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
    } catch (e: any) {
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
    } catch (e: any) {
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
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const displayName = fullName?.split(" ")[0] || profile?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div>
      <section className="relative h-64 overflow-hidden bg-muted sm:h-80">
        {profile?.coverUrl ? (
          <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Banner preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Creator dashboard</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Hello, {displayName} 👋</h1>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Eye, label: "Profile views", value: profile?.profileViews?.toLocaleString() || "0", delta: "+18%" },
          { icon: MousePointerClick, label: "Clicks", value: profile?.clicks?.toLocaleString() || "0", delta: "+9%" },
          { icon: TrendingUp, label: "Bookings", value: profile?.bookings?.toLocaleString() || "0", delta: "+4" },
        ].map((s) => (
          <div key={s.label} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <Badge variant="secondary" className="rounded-full text-xs text-emerald-600">{s.delta}</Badge>
            </div>
            <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Edit profile</h2>
          <div className="mt-5">
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.fullName || user?.email || "creator"}`}
                alt=""
                className="h-20 w-20 rounded-full border border-border object-cover bg-muted"
              />
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                <Camera className="h-4 w-4" />
                {uploadingAvatar ? "Uploading..." : "Upload profile photo"}
                <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarUpload} disabled={uploadingAvatar} />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                <ImageIcon className="h-4 w-4" />
                {uploadingCover ? "Uploading..." : "Upload banner"}
                <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={onCoverUpload} disabled={uploadingCover} />
              </label>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><Label>Display name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Handle</Label><Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@yourname" className="mt-1.5" /></div>
            <div><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Fashion, Tech…" className="mt-1.5" /></div>
            <div><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mumbai, India" className="mt-1.5" /></div>
            <div><Label>Starting price (₹)</Label><Input type="number" value={startingPrice} onChange={(e) => setStartingPrice(Number(e.target.value))} className="mt-1.5" /></div>
            <div className="sm:col-span-2"><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5" rows={3} /></div>
          </div>

          <h3 className="mt-8 font-display text-base font-semibold">Social presence</h3>
          <p className="mb-4 text-xs text-muted-foreground">Update your social handles and follower counts manually.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-3 rounded-2xl border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-semibold">Instagram</span>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Handle</Label>
                <Input size={1} value={instaHandle} onChange={(e) => setInstaHandle(e.target.value)} placeholder="@username" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</Label>
                <Input type="number" value={instaFollowers} onChange={(e) => setInstaFollowers(Number(e.target.value))} className="h-8 text-xs" />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold">Facebook</span>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Handle</Label>
                <Input size={1} value={fbHandle} onChange={(e) => setFbHandle(e.target.value)} placeholder="username" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</Label>
                <Input type="number" value={fbFollowers} onChange={(e) => setFbFollowers(Number(e.target.value))} className="h-8 text-xs" />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-blue-800" />
                <span className="text-sm font-semibold">LinkedIn</span>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Handle</Label>
                <Input size={1} value={liHandle} onChange={(e) => setLiHandle(e.target.value)} placeholder="in/username" className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</Label>
                <Input type="number" value={liFollowers} onChange={(e) => setLiFollowers(Number(e.target.value))} className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <h3 className="mt-8 font-display text-base font-semibold">Portfolio</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {portfolioImages?.map((img) => (
              <div key={img._id} className="group relative aspect-square overflow-hidden rounded-2xl border border-border">
                {img.url && <img src={img.url} alt="" className="h-full w-full object-cover" />}
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
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveProfile} disabled={saving} className="rounded-full gradient-sunset border-0 text-white shadow-glow">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pricing</h2>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setTiers([...tiers, { name: "New tier", price: 0, sortOrder: tiers.length }])}
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
                      const next = [...tiers]; next[idx] = { ...t, name: e.target.value }; setTiers(next);
                    }}
                    className="h-8 max-w-[60%] font-display font-semibold"
                  />
                  <span className="font-display font-bold">{formatINR(t.price)}</span>
                  <button onClick={() => removeTier(idx)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  type="number"
                  value={t.price}
                  onChange={(e) => {
                    const next = [...tiers]; next[idx] = { ...t, price: Number(e.target.value) }; setTiers(next);
                  }}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
          <Button onClick={savePricing} variant="secondary" className="mt-5 w-full rounded-full">Update pricing</Button>
        </div>
      </div>
    </div>
    </div>
  );
}
