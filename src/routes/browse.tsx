import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Search, MapPin, Star, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  formatFollowers,
  influencers,
  type Influencer,
  CATEGORY_OPTIONS,
} from "@/data/influencers";
import { formatINR } from "@/lib/format";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Browse() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState("");

  const handleCreatorCardClick = (creatorId: string) => {
    setPendingRedirectUrl(`/influencer/${creatorId}`);
    setShowAuthModal(true);
  };

  useEffect(() => {
    document.title = "Browse creators — Lumen";
  }, []);
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([150000]);
  const [followers, setFollowers] = useState<number[]>([3000000]);
  const [location, setLocation] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [open, setOpen] = useState(false);

  const liveCreators = useQuery(api.profiles.list, {
    role: "creator",
    search: query,
  });

  const allInfluencers = useMemo(() => {
    const creators = liveCreators || [];
    const live = creators.map(
      (p) =>
        ({
          id: p._id,
          name: p.fullName,
          handle: p.handle || `@${p.fullName.toLowerCase().replace(/\s/g, "")}`,
          category: p.category || "General",
          followers:
            (p.instagramFollowers || 0) +
            (p.facebookFollowers || 0) +
            (p.linkedinFollowers || 0) +
            (p.youtubeFollowers || 0) +
            (p.quoraFollowers || 0) +
            (p.twitterFollowers || 0),
          startingPrice: p.startingPrice || 0,
          location: p.location || "India",
          rating: (p as any).rating ?? 5.0,
          reviews: (p as any).reviewsCount ?? 0,
          available: true,
          avatar:
            p.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.fullName}`,
          cover:
            p.coverUrl ||
            `https://api.dicebear.com/7.x/shapes/svg?seed=${p.fullName}`,
          bio: p.bio || "",
        }) as Influencer,
    );

    return [...live, ...influencers];
  }, [liveCreators]);

  const ranges = useMemo(() => {
    const pricesList = allInfluencers
      .map((i) => i.startingPrice)
      .filter((p) => p > 0);
    const followersList = allInfluencers
      .map((i) => i.followers)
      .filter((f) => f > 0);

    const minP = pricesList.length > 0 ? Math.min(...pricesList) : 1000;
    const maxP = pricesList.length > 0 ? Math.max(...pricesList) : 150000;
    const minF = followersList.length > 0 ? Math.min(...followersList) : 1000;
    const maxF =
      followersList.length > 0 ? Math.max(...followersList) : 3000000;

    return {
      minPrice: minP,
      maxPrice: maxP,
      minFollowers: minF,
      maxFollowers: maxF,
    };
  }, [allInfluencers]);

  const [hasInitializedRanges, setHasInitializedRanges] = useState(false);

  useEffect(() => {
    if (allInfluencers.length > 0 && !hasInitializedRanges) {
      setPrice([ranges.maxPrice]);
      setFollowers([ranges.maxFollowers]);
      setHasInitializedRanges(true);
    }
  }, [allInfluencers, ranges, hasInitializedRanges]);

  const sliderMinPrice =
    ranges.minPrice === ranges.maxPrice ? 0 : ranges.minPrice;
  const sliderMaxPrice = ranges.maxPrice;
  const priceStep = Math.max(
    1,
    Math.round((sliderMaxPrice - sliderMinPrice) / 50),
  );

  const sliderMinFollowers =
    ranges.minFollowers === ranges.maxFollowers ? 0 : ranges.minFollowers;
  const sliderMaxFollowers = ranges.maxFollowers;
  const followersStep = Math.max(
    1,
    Math.round((sliderMaxFollowers - sliderMinFollowers) / 50),
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const i of allInfluencers) {
      if (i.category) {
        const cats = i.category.split(",").map((c) => c.trim());
        for (const cat of cats) {
          if (cat) {
            counts[cat] = (counts[cat] || 0) + 1;
          }
        }
      }
    }
    return counts;
  }, [allInfluencers]);

  const filtered = useMemo(() => {
    return allInfluencers.filter((i) => {
      // Basic query filter is already handled by Convex for live creators,
      // but we apply it here for mock data and extra safety.
      if (
        query &&
        !`${i.name} ${i.handle} ${i.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        return false;
      if (activeCats.length) {
        const creatorCats = i.category
          .split(",")
          .map((c) => c.trim().toLowerCase());
        const hasMatch = activeCats.some((cat) =>
          creatorCats.includes(cat.toLowerCase()),
        );
        if (!hasMatch) return false;
      }
      if (i.startingPrice > price[0]) return false;
      if (i.followers > followers[0]) return false;
      if (
        location &&
        !i.location.toLowerCase().includes(location.toLowerCase())
      )
        return false;
      if (availableOnly && !i.available) return false;
      return true;
    });
  }, [
    allInfluencers,
    query,
    activeCats,
    price,
    followers,
    location,
    availableOnly,
  ]);

  const toggleCat = (c: string) =>
    setActiveCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  const Filters = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Category</h3>
        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {CATEGORY_OPTIONS.map((cName) => {
            const count = categoryCounts[cName] || 0;
            return (
              <label
                key={cName}
                className="flex cursor-pointer items-center gap-3 text-sm"
              >
                <Checkbox
                  checked={activeCats.includes(cName)}
                  onCheckedChange={() => toggleCat(cName)}
                />
                <span className="flex-1">{cName}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold">Price</h3>
          <span className="text-xs text-muted-foreground">
            Up to {formatINR(price[0])}
          </span>
        </div>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={sliderMinPrice}
          max={sliderMaxPrice}
          step={priceStep}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold">Followers</h3>
          <span className="text-xs text-muted-foreground">
            Up to {formatFollowers(followers[0])}
          </span>
        </div>
        <Slider
          value={followers}
          onValueChange={setFollowers}
          min={sliderMinFollowers}
          max={sliderMaxFollowers}
          step={followersStep}
        />
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Location</h3>
        <Input
          placeholder="e.g. Delhi"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox
            checked={availableOnly}
            onCheckedChange={(v) => setAvailableOnly(Boolean(v))}
          />
          Available now
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Browse creators
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} creators match your filters
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft sm:w-96">
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full lg:hidden"
            onClick={() => setOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6">
            {Filters}
          </div>
        </aside>

        {/* mobile filter drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Filters</h2>
                <button onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              {Filters}
            </div>
          </div>
        )}

        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">
                No creators found
              </h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Try widening your filters or clearing your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {filtered.map((inf) => (
                <Link
                  key={inf.id}
                  to={`/influencer/${inf.id}`}
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      handleCreatorCardClick(inf.id);
                    }
                  }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-none"
                >
                  <div className="relative h-24 sm:h-32 overflow-hidden">
                    <img
                      src={inf.cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {inf.available && (
                      <Badge className="absolute right-2 top-2 rounded-full border-0 bg-emerald-500 text-[10px] sm:text-xs text-white px-2 py-0.5 sm:px-2.5 sm:py-0.5">
                        ● Available
                      </Badge>
                    )}
                  </div>
                  <div className="-mt-6 sm:-mt-8 flex-1 px-3 pb-3 sm:px-5 sm:pb-5">
                    <img
                      src={inf.avatar}
                      alt={inf.name}
                      className="relative z-10 h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-card object-cover shadow-sm bg-muted"
                    />
                    <div className="mt-2.5 sm:mt-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display font-semibold text-xs sm:text-base">
                          {inf.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {inf.handle}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-0.5 text-xs sm:text-sm font-medium text-amber">
                        <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                        {inf.rating}
                      </span>
                    </div>
                    <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
                      <Badge variant="secondary" className="rounded-full text-[10px] sm:text-xs px-2 py-0.5">
                        {inf.category}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full text-[10px] sm:text-xs px-2 py-0.5">
                        <MapPin className="mr-1 h-3 w-3" />
                        {inf.location.split(",")[0]}
                      </Badge>
                    </div>
                    <div className="mt-3.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-border pt-3 text-[10px] sm:text-sm gap-1">
                      <span className="text-muted-foreground">
                        {formatFollowers(inf.followers)} followers
                      </span>
                      <span className="font-display text-xs sm:text-base font-bold text-gradient-sunset">
                        {formatINR(inf.startingPrice)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-elevated animate-in fade-in zoom-in duration-200">
            <h3 className="font-display text-lg font-bold text-foreground">
              Sign In Required
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view creator details.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowAuthModal(false);
                  navigate("/login", { state: { from: pendingRedirectUrl } });
                }}
                className="rounded-full gradient-sunset border-0 text-white shadow-glow"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
