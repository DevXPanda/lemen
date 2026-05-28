import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, MapPin, Star, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { categories, formatFollowers, influencers, type Influencer } from "@/data/influencers";
import { formatINR } from "@/lib/format";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      search: (search.search as string) || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Browse creators — Lumen" },
      { name: "description", content: "Filter and discover creators by niche, price, location, and reach." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const searchParams = Route.useSearch();
  const [query, setQuery] = useState(searchParams.search || "");
  const [activeCats, setActiveCats] = useState<string[]>([]);
  const [price, setPrice] = useState<number[]>([150000]);
  const [followers, setFollowers] = useState<number[]>([3000000]);
  const [location, setLocation] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [open, setOpen] = useState(false);

  const liveCreators = useQuery(api.profiles.list, { role: "creator", search: query }) || [];

  const allInfluencers = useMemo(() => {
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

    return [...live, ...influencers];
  }, [liveCreators]);

  const filtered = useMemo(() => {
    return allInfluencers.filter((i) => {
      // Basic query filter is already handled by Convex for live creators, 
      // but we apply it here for mock data and extra safety.
      if (query && !`${i.name} ${i.handle} ${i.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (activeCats.length && !activeCats.includes(i.category)) return false;
      if (i.startingPrice > price[0]) return false;
      if (i.followers > followers[0]) return false;
      if (location && !i.location.toLowerCase().includes(location.toLowerCase())) return false;
      if (availableOnly && !i.available) return false;
      return true;
    });
  }, [allInfluencers, query, activeCats, price, followers, location, availableOnly]);

  const toggleCat = (c: string) =>
    setActiveCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const Filters = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Category</h3>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.name} className="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox checked={activeCats.includes(c.name)} onCheckedChange={() => toggleCat(c.name)} />
              <span className="flex-1">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold">Price</h3>
          <span className="text-xs text-muted-foreground">Up to {formatINR(price[0])}</span>
        </div>
        <Slider value={price} onValueChange={setPrice} min={10000} max={150000} step={5000} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold">Followers</h3>
          <span className="text-xs text-muted-foreground">Up to {formatFollowers(followers[0])}</span>
        </div>
        <Slider value={followers} onValueChange={setFollowers} min={100000} max={3000000} step={50000} />
      </div>

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Location</h3>
        <Input placeholder="e.g. Berlin" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox checked={availableOnly} onCheckedChange={(v) => setAvailableOnly(Boolean(v))} />
          Available now
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Browse creators</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} creators match your filters</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-soft sm:w-96">
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <Button size="sm" variant="ghost" className="rounded-full lg:hidden" onClick={() => setOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border border-border bg-card p-6">{Filters}</div>
        </aside>

        {/* mobile filter drawer */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Filters</h2>
                <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
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
              <h3 className="font-display text-lg font-semibold">No creators found</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Try widening your filters or clearing your search.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((inf) => (
                <Link
                  key={inf.id}
                  to="/influencer/$id"
                  params={{ id: inf.id }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:shadow-none"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img src={inf.cover} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    {inf.available && (
                      <Badge className="absolute right-3 top-3 rounded-full border-0 bg-emerald-500 text-white">
                        ● Available
                      </Badge>
                    )}
                  </div>
                  <div className="-mt-8 flex-1 px-5 pb-5">
                    <img src={inf.avatar} alt={inf.name} className="relative z-10 h-16 w-16 rounded-full border-4 border-card object-cover shadow-sm bg-muted" />
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-display font-semibold">{inf.name}</h3>
                        <p className="text-xs text-muted-foreground">{inf.handle}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber">
                        <Star className="h-3.5 w-3.5 fill-current" />{inf.rating}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full">{inf.category}</Badge>
                      <Badge variant="secondary" className="rounded-full"><MapPin className="mr-1 h-3 w-3" />{inf.location.split(",")[0]}</Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                      <span className="text-muted-foreground">{formatFollowers(inf.followers)} followers</span>
                      <span className="font-display font-bold text-gradient-sunset">{formatINR(inf.startingPrice)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
