import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export function MessagesPage() {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    document.title = "Messages —  Pravixo Admin";
  }, []);

  const data = useQuery(
    api.admin.listMessages,
    id ? { conversationId: id as Id<"conversations"> } : "skip",
  );

  if (!id) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">No conversation selected.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/conversations"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {!data ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={
                  data.creator?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${data.creator?.fullName || "C"}`
                }
                alt=""
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
              <div>
                <div className="text-sm font-semibold">
                  {data.creator?.fullName || "Unknown Creator"}
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] bg-violet/10 text-violet"
                >
                  creator
                </Badge>
              </div>
            </div>
            <span className="text-lg text-muted-foreground">↔</span>
            <div className="flex items-center gap-2">
              <img
                src={
                  data.brand?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${data.brand?.fullName || "B"}`
                }
                alt=""
                className="h-10 w-10 rounded-full border border-border object-cover"
              />
              <div>
                <div className="text-sm font-semibold">
                  {data.brand?.fullName || "Unknown Brand"}
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] bg-amber/10 text-amber"
                >
                  brand
                </Badge>
              </div>
            </div>
            {data.conversation && (
              <Badge
                variant="secondary"
                className={`ml-4 rounded-full text-[10px] capitalize ${
                  data.conversation.status === "active"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : data.conversation.status === "pending"
                      ? "bg-amber/10 text-amber"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {data.conversation.status}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="mt-6 flex-1 rounded-3xl border border-border bg-card overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 p-6">
            {!data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}
                >
                  <div className="max-w-[70%] space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                  </div>
                </div>
              ))
            ) : data.messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No messages in this conversation
              </div>
            ) : (
              data.messages.map((msg) => {
                const isCreator =
                  data.creator && msg.senderId === data.creator._id;
                const senderName = msg.sender?.fullName || "Unknown";
                const senderAvatar =
                  msg.sender?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${senderName}`;

                return (
                  <div
                    key={msg._id}
                    className={`flex gap-3 ${isCreator ? "" : "flex-row-reverse"}`}
                  >
                    <img
                      src={senderAvatar}
                      alt=""
                      className="mt-1 h-7 w-7 shrink-0 rounded-full border border-border object-cover"
                    />
                    <div
                      className={`max-w-[70%] ${isCreator ? "" : "text-right"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-semibold ${
                            isCreator ? "text-violet" : "text-amber"
                          }`}
                        >
                          {senderName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg._creationTime), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                          isCreator
                            ? "rounded-tl-sm bg-secondary text-foreground"
                            : "rounded-tr-sm gradient-sunset text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="mt-0.5">
                        {msg.read ? (
                          <CheckCheck className="inline h-3 w-3 text-primary" />
                        ) : (
                          <Check className="inline h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
