import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Clock, Filter, Heart, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFollowers, influencers } from "@/data/influencers";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";

export const Route = createFileRoute("/dashboard/customer")({
  head: () => ({ meta: [{ title: "Brand dashboard — Lumen" }] }),
  component: CustomerDash,
});

function CustomerDash() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  const saved = influencers.slice(0, 4);
  const recent = [
    "fashion creators in Mumbai",
    "fitness reels under ₹40,000",
    "tech reviewers 1M+",
    "food bloggers Delhi",
  ];

  const firstName = profile?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "";

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
                <h2 className="font-display text-lg font-semibold">Saved creators</h2>
              </div>
              <Link to="/browse" className="text-xs font-medium text-primary hover:underline">Find more →</Link>
            </div>

            {saved.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {saved.map((inf) => (
                  <div key={inf.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
                    <img src={inf.avatar} alt="" className="h-12 w-12 rounded-full object-cover aspect-square flex-shrink-0 border border-border/50 shadow-sm" />
                    <div className="min-w-0 flex-1">
                      <Link to="/influencer/$id" params={{ id: inf.id }} className="block truncate font-display text-sm font-semibold hover:text-primary">
                        {inf.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{inf.category} · {formatFollowers(inf.followers)}</p>
                    </div>
                    <button
                      onClick={() => toast("Removed from favorites")}
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

          {/* recent searches */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Recent searches</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((q) => (
                <Link key={q} to="/browse">
                  <Badge variant="secondary" className="rounded-full px-3 py-1.5 text-xs hover:bg-accent">
                    <Search className="mr-1.5 h-3 w-3" /> {q}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* filter prefs */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Your preferences</h2>
          </div>
          <div className="space-y-4 text-sm">
            {[
              { k: "Niches", v: "Fashion · Beauty · Lifestyle" },
              { k: "Budget", v: "₹20,000 – ₹1,00,000 / post" },
              { k: "Reach", v: "100K – 1M followers" },
              { k: "Regions", v: "India · South Asia" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-muted-foreground">{row.k}</span>
                <span className="font-medium">{row.v}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => toast.success("Preferences saved")} className="mt-5 w-full rounded-full gradient-sunset border-0 text-white shadow-glow">
            Update preferences
          </Button>
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
      <p className="mt-1 text-xs text-muted-foreground">Tap the heart on any profile to save them here.</p>
      <Link to="/browse"><Button size="sm" className="mt-4 rounded-full">Browse creators</Button></Link>
    </div>
  );
}
