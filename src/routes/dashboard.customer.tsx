import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFollowers, influencers } from "@/data/influencers";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";

export function CustomerDash() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();

  const [niches, setNiches] = useState("");
  const [budget, setBudget] = useState("");
  const [reach, setReach] = useState("");
  const [regions, setRegions] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const updateProfile = useMutation(api.profiles.update);

  const conversations = useQuery(
    api.messages.getConversations,
    profile ? { profileId: profile._id, role: profile.role } : "skip",
  );

  useEffect(() => {
    document.title = "Brand dashboard — Lumen";
  }, []);

  useEffect(() => {
    if (profile) {
      setNiches(profile.prefNiches || "");
      setBudget(profile.prefBudget || "");
      setReach(profile.prefReach || "");
      setRegions(profile.prefRegions || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    try {
      await updateProfile({
        id: profile._id,
        prefNiches: niches,
        prefBudget: budget,
        prefReach: reach,
        prefRegions: regions,
      });
      toast.success("Preferences updated successfully");
      setIsEditing(false);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setUpdating(false);
    }
  };

  const favsQuery = useQuery(
    api.profiles.getFavorites,
    profile ? { brandId: profile._id } : "skip",
  );
  const toggleFavorite = useMutation(api.profiles.toggleFavorite);

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
      console.error(e);
    }
  };

  const recent = [
    "fashion creators in Mumbai",
    "fitness reels under ₹40,000",
    "tech reviewers 1M+",
    "food bloggers Delhi",
  ];

  const firstName =
    profile?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Brand dashboard</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Welcome back{firstName ? `, ${firstName}` : ""} 👋
        </h1>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* saved */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">
                  Saved creators
                </h2>
              </div>
              <Link
                to="/browse"
                className="text-xs font-medium text-primary hover:underline"
              >
                Find more →
              </Link>
            </div>

            {saved.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {saved.map((inf) => (
                  <div
                    key={inf.id}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3"
                  >
                    <img
                      src={inf.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover aspect-square flex-shrink-0 border border-border/50 shadow-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/influencer/${inf.id}`}
                        className="block truncate font-display text-sm font-semibold hover:text-primary"
                      >
                        {inf.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {inf.category} · {formatFollowers(inf.followers || 0)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(inf.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hiring History */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Hiring History
              </h2>
            </div>

            {!conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No creators hired yet
                </p>
                <Link to="/browse" className="mt-3">
                  <Button size="sm" className="rounded-full">
                    Hire creators
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
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
                        className="h-12 w-12 rounded-full object-cover aspect-square flex-shrink-0 border border-border/50 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/influencer/${creator._id}`}
                          className="block truncate font-display text-sm font-semibold hover:text-primary"
                        >
                          {creator.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {creator.category || "General"} ·{" "}
                          {creator.location || "India"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] capitalize rounded-full px-2.5 py-0.5"
                      >
                        {c.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* recent searches */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">
                Recent searches
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((q) => (
                <Link key={q} to="/browse">
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    <Search className="mr-1.5 h-3 w-3" /> {q}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* filter prefs */}
        <div className="rounded-3xl border border-border bg-card p-6 h-fit">
          <div className="mb-5 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              Your preferences
            </h2>
          </div>

          {isEditing ? (
            <form
              onSubmit={handleSavePreferences}
              className="space-y-4 text-sm"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Niches
                </label>
                <Input
                  value={niches}
                  onChange={(e) => setNiches(e.target.value)}
                  placeholder="Fashion · Beauty · Lifestyle"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Budget
                </label>
                <Input
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="₹20,000 – ₹1,00,000 / post"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Reach
                </label>
                <Input
                  value={reach}
                  onChange={(e) => setReach(e.target.value)}
                  placeholder="100K – 1M followers"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Regions
                </label>
                <Input
                  value={regions}
                  onChange={(e) => setRegions(e.target.value)}
                  placeholder="India · South Asia"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-full gradient-sunset border-0 text-white shadow-glow"
                >
                  <Save className="mr-1.5 h-4 w-4" />{" "}
                  {updating ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setNiches(profile.prefNiches || "");
                      setBudget(profile.prefBudget || "");
                      setReach(profile.prefReach || "");
                      setRegions(profile.prefRegions || "");
                    }
                  }}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-sm">
              {[
                {
                  k: "Niches",
                  v: profile?.prefNiches || "Fashion · Beauty · Lifestyle",
                },
                {
                  k: "Budget",
                  v: profile?.prefBudget || "₹20,000 – ₹1,00,000 / post",
                },
                { k: "Reach", v: profile?.prefReach || "100K – 1M followers" },
                {
                  k: "Regions",
                  v: profile?.prefRegions || "India · South Asia",
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                >
                  <span className="text-muted-foreground">{row.k}</span>
                  <span className="font-medium text-right">{row.v}</span>
                </div>
              ))}
              <Button
                onClick={() => setIsEditing(true)}
                className="mt-5 w-full rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                <Edit2 className="mr-1.5 h-4 w-4" /> Update preferences
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
        <Heart className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="font-display font-semibold">No saved creators yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Tap the heart on any profile to save them here.
      </p>
      <Link to="/browse">
        <Button size="sm" className="mt-4 rounded-full">
          Browse creators
        </Button>
      </Link>
    </div>
  );
}
