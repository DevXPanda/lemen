import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { ChatDialog } from "@/components/chat-dialog";
import {
  MessageSquare,
  Search,
  Filter,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function MessagesPage() {
  const { profile } = useAuth();
  const [activeConv, setActiveConv] = useState<Id<"conversations"> | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "archived"
  >("all");

  useEffect(() => {
    document.title = "Messages — Lumen";
  }, []);

  const conversations = useQuery(
    api.messages.getConversations,
    profile ? { profileId: profile._id, role: profile.role } : "skip",
  );

  const toggleArchive = useMutation(api.messages.toggleArchive);

  const handleToggleArchive = async (
    conversationId: Id<"conversations">,
    isArchived: boolean,
  ) => {
    try {
      await toggleArchive({ conversationId });
      toast.success(
        isArchived ? "Conversation unarchived" : "Conversation archived",
      );
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Failed to update conversation");
    }
  };

  const filteredConversations = conversations?.filter((c) => {
    const matchesSearch = c.otherProfile?.fullName
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "all") {
      return !c.archived;
    }
    if (activeFilter === "unread") {
      return !c.archived && c.unreadCount > 0;
    }
    if (activeFilter === "archived") {
      return !!c.archived;
    }
    return true;
  });

  if (!profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Please log in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="font-display text-3xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Manage your collaborations and inquiries.
        </p>
      </div>

      <div className="grid h-[600px] lg:h-[700px] gap-6 lg:grid-cols-[350px_1fr]">
        {/* LEFT: Sidebar */}
        <div className={`flex flex-col rounded-3xl border border-border bg-card overflow-hidden ${activeConv ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 border-b border-border space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 rounded-full bg-secondary/50 border-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge
                onClick={() => setActiveFilter("all")}
                className={`rounded-full cursor-pointer border-0 transition-all ${
                  activeFilter === "all"
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </Badge>
              <Badge
                onClick={() => setActiveFilter("unread")}
                className={`rounded-full cursor-pointer border-0 transition-all ${
                  activeFilter === "unread"
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Unread
              </Badge>
              <Badge
                onClick={() => setActiveFilter("archived")}
                className={`rounded-full cursor-pointer border-0 transition-all ${
                  activeFilter === "archived"
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                Archived
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations?.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No conversations found.
              </div>
            ) : (
              filteredConversations?.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setActiveConv(c._id)}
                  className={`flex cursor-pointer items-center gap-3 border-b border-border/50 p-4 transition-all hover:bg-secondary/50 ${
                    activeConv === c._id
                      ? "bg-accent/40 border-l-4 border-l-primary"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={
                        c.otherProfile?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${c.otherProfile?.fullName}`
                      }
                      className="h-12 w-12 rounded-2xl object-cover shadow-soft"
                    />
                    {c.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-card">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="truncate font-display font-semibold">
                        {c.otherProfile?.fullName}
                      </h4>
                      <span className="text-[10px] text-muted-foreground">
                        {c.lastMessage
                          ? new Date(
                              c.lastMessage._creationTime,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="truncate text-xs text-muted-foreground flex-1 pr-2">
                        {c.lastMessage?.text}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleArchive(c._id, !!c.archived);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors"
                        title={c.archived ? "Unarchive" : "Archive"}
                      >
                        {c.archived ? (
                          <ArchiveRestore className="h-3.5 w-3.5" />
                        ) : (
                          <Archive className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Chat Area */}
        <div className={`flex flex-col rounded-3xl border border-border bg-card overflow-hidden relative ${activeConv ? "flex" : "hidden lg:flex"}`}>
          {activeConv ? (
            <div className="h-full flex flex-col">
              <ChatDialog
                conversationId={activeConv}
                profileId={profile._id}
                onClose={() => setActiveConv(null)}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold">Your Inbox</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Select a conversation from the left to start chatting with your
                partners.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
