import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Building2,
  MessageSquare,
  Mail,
  Heart,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";

export function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard — Pravixo Admin";
  }, []);

  const stats = useQuery(api.admin.stats);
  const allProfiles = useQuery(api.profiles.list, {});
  const allConversations = useQuery(api.admin.listAllConversations);

  const recentUsers = allProfiles?.slice(-5).reverse();
  const recentConvs = allConversations?.slice(-5).reverse();

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers,
      icon: Users,
      gradient: "gradient-sunset",
      shadow: "shadow-glow",
    },
    {
      label: "Creators",
      value: stats?.creators,
      icon: UserCheck,
      gradient: "gradient-warm",
      shadow: "shadow-glow",
    },
    {
      label: "Brands",
      value: stats?.brands,
      icon: Building2,
      gradient: "gradient-pink",
      shadow: "shadow-pink",
    },
    {
      label: "Conversations",
      value: stats?.conversations,
      icon: MessageSquare,
      gradient: "gradient-sunset",
      shadow: "shadow-glow",
    },
    {
      label: "Messages",
      value: stats?.messages,
      icon: Mail,
      gradient: "gradient-warm",
      shadow: "shadow-glow",
    },
    {
      label: "Favorites",
      value: stats?.favorites,
      icon: Heart,
      gradient: "gradient-pink",
      shadow: "shadow-pink",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview and recent activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600">
            Live data
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="group rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.gradient} ${card.shadow} transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <div className="mt-4">
              {card.value !== undefined ? (
                <div className="font-display text-3xl font-bold">
                  {formatNumber(card.value)}
                </div>
              ) : (
                <Skeleton className="h-9 w-20" />
              )}
              <div className="mt-0.5 text-sm text-muted-foreground">
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent Users</h2>
            <Link
              to="/users"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {!recentUsers ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No users yet
              </p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-3 rounded-2xl border border-border/50 p-3 transition-colors hover:bg-secondary/50"
                >
                  <img
                    src={
                      u.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${u.fullName}`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {u.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u.handle ? `@${u.handle}` : u.category || "—"}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`rounded-full text-[10px] ${
                      u.role === "creator"
                        ? "bg-violet/10 text-violet"
                        : "bg-amber/10 text-amber"
                    }`}
                  >
                    {u.role}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Recent Conversations
            </h2>
            <Link
              to="/conversations"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {!recentConvs ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : recentConvs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No conversations yet
              </p>
            ) : (
              recentConvs.map((c) => (
                <Link
                  key={c._id}
                  to={`/messages/${c._id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border/50 p-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="relative">
                    <img
                      src={
                        c.creator?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${c.creator?.fullName || "C"}`
                      }
                      alt=""
                      className="h-10 w-10 rounded-full border border-border object-cover"
                    />
                    <img
                      src={
                        c.brand?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${c.brand?.fullName || "B"}`
                      }
                      alt=""
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-card object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {c.creator?.fullName || "Unknown"}{" "}
                      <span className="font-normal text-muted-foreground">
                        ↔
                      </span>{" "}
                      {c.brand?.fullName || "Unknown"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {c.lastMessage?.text || "No messages"}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`rounded-full text-[10px] ${
                      c.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : c.status === "pending"
                          ? "bg-amber/10 text-amber"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.status}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
