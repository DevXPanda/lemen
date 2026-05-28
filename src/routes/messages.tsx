import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/auth-provider";
import { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { ChatDialog } from "@/components/chat-dialog";
import { MessageSquare, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Lumen" }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { profile } = useAuth();
  const [activeConv, setActiveConv] = useState<Id<"conversations"> | null>(null);
  const [search, setSearch] = useState("");

  const conversations = useQuery(
    api.messages.getConversations,
    profile ? { profileId: profile._id, role: profile.role } : "skip"
  );

  const filteredConversations = conversations?.filter((c) =>
    c.otherProfile?.fullName.toLowerCase().includes(search.toLowerCase())
  );

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
        <p className="text-sm text-muted-foreground">Manage your collaborations and inquiries.</p>
      </div>

      <div className="grid h-[700px] gap-6 lg:grid-cols-[350px_1fr]">
        {/* LEFT: Sidebar */}
        <div className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden">
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
              <Badge className="rounded-full gradient-sunset text-white border-0">All</Badge>
              <Badge variant="outline" className="rounded-full">Unread</Badge>
              <Badge variant="outline" className="rounded-full">Archived</Badge>
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
                    activeConv === c._id ? "bg-accent/40 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={c.otherProfile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${c.otherProfile?.fullName}`}
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
                      <h4 className="truncate font-display font-semibold">{c.otherProfile?.fullName}</h4>
                      <span className="text-[10px] text-muted-foreground">2m</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{c.lastMessage?.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Chat Area */}
        <div className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden relative">
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
                Select a conversation from the left to start chatting with your partners.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
