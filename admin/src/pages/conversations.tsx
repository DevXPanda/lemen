import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Eye, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function ConversationsPage() {
  useEffect(() => {
    document.title = "Conversations —  Pravixo Admin";
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Id<"conversations"> | null>(
    null,
  );

  const conversations = useQuery(api.admin.listAllConversations);
  const deleteConversation = useMutation(api.admin.deleteConversation);

  const filtered = conversations?.filter(
    (c) => !statusFilter || c.status === statusFilter,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConversation({ id: deleteTarget });
      toast.success("Conversation deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600";
      case "pending":
        return "bg-amber/10 text-amber";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Conversations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all platform conversations between creators and brands
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        {["", "pending", "active", "completed"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            className={`rounded-full capitalize ${statusFilter === s ? "gradient-sunset border-0 text-white" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "" ? "All" : s}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 rounded-3xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Creator</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filtered ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No conversations found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c._id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          c.creator?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${c.creator?.fullName || "C"}`
                        }
                        alt=""
                        className="h-9 w-9 rounded-full border border-border object-cover"
                      />
                      <span className="text-sm font-medium">
                        {c.creator?.fullName || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          c.brand?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${c.brand?.fullName || "B"}`
                        }
                        alt=""
                        className="h-9 w-9 rounded-full border border-border object-cover"
                      />
                      <span className="text-sm font-medium">
                        {c.brand?.fullName || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-full text-[10px] capitalize ${statusColor(c.status)}`}
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {c.messageCount}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate text-sm text-muted-foreground">
                      {c.lastMessage?.text || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/messages/${c._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(c._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filtered && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            Showing {filtered.length} conversation
            {filtered.length !== 1 && "s"}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this conversation?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and all its
              messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
