import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Check,
  X,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export function ConnectionsPage() {
  const navigate = useNavigate();
  const { profile, user, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");

  useEffect(() => {
    document.title = "Connections — Lumen";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const connections = useQuery(
    api.connections.getAllConnections,
    profile ? { profileId: profile._id, role: profile.role } : "skip"
  );

  const acceptConnection = useMutation(api.connections.acceptRequest);
  const rejectConnection = useMutation(api.connections.rejectRequest);

  const filteredConnections = useMemo(() => {
    if (!connections) return [];
    return connections.filter((c) => {
      const nameMatch = c.otherProfile?.fullName
        ?.toLowerCase()
        ?.includes(search.toLowerCase());
      const categoryMatch = c.otherProfile?.category
        ?.toLowerCase()
        ?.includes(search.toLowerCase());
      const matchesSearch = nameMatch || categoryMatch;

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      return c.status === activeTab;
    });
  }, [connections, search, activeTab]);

  if (loading || !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const roleText = profile.role === "brand" ? "creators" : "brands";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" /> Connections
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage collaborations, review pitches, and unlock direct messaging with {roleText}.
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-1 bg-secondary/35 p-1 rounded-full border border-border/50 max-w-max">
          {(["all", "pending", "accepted", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all capitalize ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${roleText}...`}
            className="pl-10 rounded-full bg-card border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LIST OF CARDS */}
      {!connections ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading your connections...
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 py-16 px-4 text-center">
          <Users className="h-10 w-10 text-muted-foreground/35 mb-3" />
          <h3 className="font-display text-base font-semibold">No connections found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {activeTab === "all"
              ? `You don't have any connection requests with ${roleText} yet.`
              : `No connections with status "${activeTab}" matches your query.`}
          </p>
          {activeTab === "all" && (
            <Link to="/browse" className="mt-4">
              <Button size="sm" className="rounded-full gradient-sunset border-0 text-white shadow-glow">
                Browse {roleText}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredConnections.map((req) => {
            const partner = req.otherProfile;
            if (!partner) return null;

            return (
              <div
                key={req._id}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-elevated flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          partner.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${partner.fullName}`
                        }
                        alt={partner.fullName}
                        className="h-12 w-12 rounded-2xl object-cover border border-border/50 shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/influencer/${partner._id}`}
                          className="font-display text-sm font-bold hover:text-primary truncate block"
                        >
                          {partner.fullName}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {partner.category || "General"} · {partner.location || "India"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={`text-[9px] px-2 py-0.5 rounded-full border-0 font-medium tracking-wide capitalize ${
                        req.status === "accepted"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : req.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="mt-4 bg-secondary/40 rounded-2xl border border-border/40 p-3.5 text-xs text-muted-foreground/95 italic leading-relaxed">
                    "{req.pitch}"
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    Sent on {new Date(req.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  <div className="flex gap-2 self-stretch sm:self-auto">
                    {req.status === "pending" && profile.role === "brand" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 sm:flex-none rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 h-8 text-xs font-semibold px-4 flex items-center justify-center gap-1.5"
                          onClick={async () => {
                            try {
                              await acceptConnection({ connectionId: req._id });
                              toast.success(`Connected with ${partner.fullName}!`);
                            } catch (err) {
                              toast.error("Failed to accept connection");
                            }
                          }}
                        >
                          <Check className="h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-none rounded-full h-8 text-xs font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 px-4 flex items-center justify-center gap-1.5"
                          onClick={async () => {
                            try {
                              await rejectConnection({ connectionId: req._id });
                              toast.success("Connection rejected");
                            } catch (err) {
                              toast.error("Failed to reject connection");
                            }
                          }}
                        >
                          <X className="h-3.5 w-3.5" /> Decline
                        </Button>
                      </>
                    )}

                    {req.status === "accepted" && (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto rounded-full bg-primary hover:opacity-95 text-primary-foreground h-8 text-xs font-semibold px-4 flex items-center justify-center gap-1.5"
                        onClick={() => navigate("/messages")}
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Chat
                      </Button>
                    )}

                    {req.status === "pending" && profile.role === "creator" && (
                      <span className="flex items-center gap-1.5 text-xs text-amber font-medium py-1">
                        <Clock className="h-3.5 w-3.5" /> Awaiting Brand Review
                      </span>
                    )}

                    {req.status === "rejected" && (
                      <span className="text-xs text-destructive font-medium py-1">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
