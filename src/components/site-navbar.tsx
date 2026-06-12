import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  Sparkles,
  Menu,
  X,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./theme-provider";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChatDialog } from "./chat-dialog";
import { Id } from "../../convex/_generated/dataModel";
import { Badge } from "./ui/badge";
import logoImg from "@/assets/log.png";

const baseLinks = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
];

export function SiteNavbar() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [activeConv, setActiveConv] = useState<Id<"conversations"> | null>(
    null,
  );

  const conversations = useQuery(
    api.messages.getConversations,
    profile ? { profileId: profile._id, role: profile.role } : "skip",
  );
  const unreadCountTotal =
    conversations?.reduce((sum, c) => sum + c.unreadCount, 0) || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        messagesRef.current &&
        !messagesRef.current.contains(event.target as Node)
      ) {
        setShowNotifs(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const links = [
    ...baseLinks,
    ...(user && profile?.role === "creator"
      ? [{ to: "/dashboard/influencer", label: "Creator" }]
      : []),
    ...(user && profile?.role === "brand"
      ? [{ to: "/dashboard/customer", label: "Brand" }]
      : []),
  ];

  const handleSignOut = async () => {
    setShowLogoutModal(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowLogoutModal(false);
    toast.success("Signed out");
    navigate("/");
    setOpen(false);
  };

  const initial =
    profile?.fullName?.trim()?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      <header className="sticky top-0 z-50 glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="Pravixo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-display text-lg font-bold tracking-tight">
              Pravixo
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {user && (
              <div ref={messagesRef} className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-secondary relative"
                >
                  <MessageSquare className="h-4 w-4" />
                  {unreadCountTotal > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm">
                      {unreadCountTotal}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="fixed left-4 right-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-hidden rounded-3xl border border-border bg-card shadow-elevated sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-5 sm:w-80">
                    <div className="border-b border-border p-4 flex items-center justify-between">
                      <h3 className="font-display font-semibold">Messages</h3>
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10px]"
                      >
                        {unreadCountTotal} New
                      </Badge>
                    </div>
                    <div className="max-h-[calc(100vh-14rem)] overflow-y-auto sm:max-h-96">
                      {conversations?.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                          No messages
                        </div>
                      ) : (
                        conversations?.map((c) => (
                          <div
                            key={c._id}
                            onClick={() => {
                              setActiveConv(c._id);
                              setShowNotifs(false);
                            }}
                            className="flex cursor-pointer items-center gap-3 border-b border-border/50 p-4 transition-colors hover:bg-secondary last:border-0"
                          >
                            <img
                              src={
                                c.otherProfile?.avatarUrl ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${c.otherProfile?.fullName}`
                              }
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="truncate font-display text-sm font-semibold">
                                  {c.otherProfile?.fullName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Just now
                                </span>
                              </div>
                              <p className="truncate text-xs text-muted-foreground">
                                {c.lastMessage?.text}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {conversations && conversations.length > 0 && (
                      <Link
                        to="/messages"
                        onClick={() => setShowNotifs(false)}
                        className="block border-t border-border p-3 text-center text-xs font-medium text-primary hover:bg-secondary transition-colors"
                      >
                        View all messages
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="h-9 w-24 rounded-full bg-secondary animate-pulse" />
            ) : user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  to={
                    profile?.role === "creator"
                      ? "/dashboard/influencer"
                      : "/dashboard/customer"
                  }
                  className="flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 transition-colors hover:bg-secondary"
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover border border-border/50"
                    />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full gradient-sunset text-[10px] font-bold text-white">
                      {initial}
                    </span>
                  )}
                  <span className="max-w-[120px] truncate text-sm font-medium">
                    {profile?.fullName || user.email}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button
                    size="sm"
                    className="rounded-full gradient-sunset border-0 text-white shadow-glow hover:opacity-95"
                  >
                    Get started
                  </Button>
                </Link>
              </>
            )}

            <button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border md:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <div className="pt-2">
                  <div className="px-3 pb-2 text-xs text-muted-foreground">
                    Signed in as {profile?.fullName || user.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      size="sm"
                      className="w-full rounded-full gradient-sunset border-0 text-white"
                    >
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close logout confirmation"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-elevated animate-in fade-in zoom-in duration-200">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-sunset text-white shadow-glow">
              <LogOut className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Are you sure you want to logout?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You can sign in again anytime.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-w-24 rounded-full border-primary/30 bg-white/10 text-foreground hover:bg-accent/40"
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </Button>
              <Button
                type="button"
                className="min-w-24 rounded-full gradient-sunset border-0 text-white shadow-glow hover:opacity-95"
                onClick={confirmSignOut}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
      {activeConv && profile && (
        <div className="fixed bottom-6 right-6 z-[60] w-[360px] max-w-[90vw] h-[500px] overflow-hidden rounded-3xl border border-border shadow-elevated">
          <ChatDialog
            conversationId={activeConv}
            profileId={profile._id}
            onClose={() => setActiveConv(null)}
          />
        </div>
      )}
    </>
  );
}
