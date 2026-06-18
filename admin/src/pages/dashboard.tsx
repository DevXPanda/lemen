import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Building2,
  MessageSquare,
  Mail,
  Heart,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard — Pravixo Admin";
  }, []);

  const stats = useQuery(api.admin.stats);
  const allProfiles = useQuery(api.profiles.list, {});
  const allConversations = useQuery(api.admin.listAllConversations);

  const recentUsers = allProfiles?.slice(-5).reverse();
  const recentConvs = allConversations?.slice(-5).reverse();

  // Active segment states for dynamic center tooltips
  const [activeRole, setActiveRole] = useState<any>(null);
  const [activeVerification, setActiveVerification] = useState<any>(null);
  const [activeConversation, setActiveConversation] = useState<any>(null);

  // Overview stats cards
  const statCards = [
    { label: "Total Users", value: stats?.totalUsers },
    { label: "Creators", value: stats?.creators },
    { label: "Brands", value: stats?.brands },
    { label: "Conversations", value: stats?.conversations },
    { label: "Messages", value: stats?.messages },
    { label: "Favorites", value: stats?.favorites },
  ];

  // User Roles Data
  const totalUserRoles = (stats?.creators || 0) + (stats?.brands || 0);
  const userRoleData = [
    { name: "Creators", value: stats?.creators || 0, color: "#8b5cf6", total: totalUserRoles }, // Violet
    { name: "Brands", value: stats?.brands || 0, color: "#f59e0b", total: totalUserRoles },    // Amber
  ];

  // Verification Statuses Data
  const verifiedCount = allProfiles?.filter((p) => p.verificationStatus === "verified").length || 0;
  const pendingCount = allProfiles?.filter((p) => p.verificationStatus === "pending").length || 0;
  const rejectedCount = allProfiles?.filter((p) => p.verificationStatus === "rejected").length || 0;
  const unverifiedCount = allProfiles?.filter((p) => !p.verificationStatus || p.verificationStatus === "unverified").length || 0;
  const totalVerification = verifiedCount + pendingCount + rejectedCount + unverifiedCount;

  const verificationData = [
    { name: "Verified", value: verifiedCount, color: "#10b981", total: totalVerification },   // Emerald
    { name: "Pending", value: pendingCount, color: "#f59e0b", total: totalVerification },     // Amber
    { name: "Rejected", value: rejectedCount, color: "#f43f5e", total: totalVerification },    // Rose
    { name: "Unverified", value: unverifiedCount, color: "#64748b", total: totalVerification }, // Slate
  ];

  // Conversation Statuses Data
  const activeConvs = allConversations?.filter((c) => c.status === "active").length || 0;
  const pendingConvs = allConversations?.filter((c) => c.status === "pending").length || 0;
  const completedConvs = allConversations?.filter((c) => c.status === "completed").length || 0;
  const totalConversations = activeConvs + pendingConvs + completedConvs;

  const conversationData = [
    { name: "Active", value: activeConvs, color: "#10b981", total: totalConversations },     // Emerald
    { name: "Pending", value: pendingConvs, color: "#f59e0b", total: totalConversations },   // Amber
    { name: "Completed", value: completedConvs, color: "#64748b", total: totalConversations }, // Slate
  ];

  const isLoading = !stats || !allProfiles || !allConversations;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform overview and analytics charts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600 animate-pulse">Live data</span>
        </div>
      </div>

      {/* Top Stat Cards (Screenshot Style) */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {card.label}
            </span>
            <div className="mt-1 font-display text-2xl font-bold">
              {card.value !== undefined ? formatNumber(card.value) : <Skeleton className="h-8 w-16" />}
            </div>
          </div>
        ))}
      </div>

      {/* Donut Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: User Roles */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> User Roles
            </h2>
          </div>
          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <Skeleton className="h-28 w-28 rounded-full" />
            </div>
          ) : (
            <div className="relative h-[200px] w-full flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(data) => setActiveRole(data)}
                    onMouseLeave={() => setActiveRole(null)}
                    className="cursor-pointer focus:outline-none"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none text-center">
                {activeRole ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in-50 zoom-in-95 duration-150">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: activeRole.color }}
                    >
                      {activeRole.name}
                    </span>
                    <span className="text-xl font-bold mt-1 text-foreground">
                      {activeRole.value}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({activeRole.total > 0 ? ((activeRole.value / activeRole.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center animate-in fade-in-50 duration-150">
                    <span className="text-2xl font-bold text-foreground">{totalUserRoles}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Users</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs border-t border-border/50 pt-4">
            {userRoleData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="text-foreground font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Verification Status */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Verification Status
            </h2>
          </div>
          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <Skeleton className="h-28 w-28 rounded-full" />
            </div>
          ) : (
            <div className="relative h-[200px] w-full flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(data) => setActiveVerification(data)}
                    onMouseLeave={() => setActiveVerification(null)}
                    className="cursor-pointer focus:outline-none"
                  >
                    {verificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none text-center">
                {activeVerification ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in-50 zoom-in-95 duration-150">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: activeVerification.color }}
                    >
                      {activeVerification.name}
                    </span>
                    <span className="text-xl font-bold mt-1 text-foreground">
                      {activeVerification.value}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({activeVerification.total > 0 ? ((activeVerification.value / activeVerification.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center animate-in fade-in-50 duration-150">
                    <span className="text-2xl font-bold text-foreground">{totalVerification}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Profiles</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs border-t border-border/50 pt-4">
            {verificationData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="text-foreground font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Conversation Status */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-violet" /> Connection Progress
            </h2>
          </div>
          {isLoading ? (
            <div className="h-[220px] flex items-center justify-center">
              <Skeleton className="h-28 w-28 rounded-full" />
            </div>
          ) : (
            <div className="relative h-[200px] w-full flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(data) => setActiveConversation(data)}
                    onMouseLeave={() => setActiveConversation(null)}
                    className="cursor-pointer focus:outline-none"
                  >
                    {conversationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none select-none text-center">
                {activeConversation ? (
                  <div className="flex flex-col items-center justify-center animate-in fade-in-50 zoom-in-95 duration-150">
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: activeConversation.color }}
                    >
                      {activeConversation.name}
                    </span>
                    <span className="text-xl font-bold mt-1 text-foreground">
                      {activeConversation.value}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({activeConversation.total > 0 ? ((activeConversation.value / activeConversation.total) * 100).toFixed(0) : 0}%)
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center animate-in fade-in-50 duration-150">
                    <span className="text-2xl font-bold text-foreground">{totalConversations}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Convs</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs border-t border-border/50 pt-4">
            {conversationData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}:</span>
                <span className="text-foreground font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
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
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
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
