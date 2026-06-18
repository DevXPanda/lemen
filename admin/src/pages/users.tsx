import { useEffect, useState } from "react";
import { Search, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatNumber } from "@/lib/format";

export function UsersPage() {
  useEffect(() => {
    document.title = "Users —  Pravixo Admin";
  }, []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<Id<"profiles"> | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const [suspendTarget, setSuspendTarget] = useState<Id<"profiles"> | null>(null);
  const [suspendName, setSuspendName] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  const profiles = useQuery(api.profiles.list, {
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const deleteProfile = useMutation(api.admin.deleteProfile);
  const updateRole = useMutation(api.admin.updateProfileRole);
  const updateVerification = useMutation(
    api.admin.updateVerificationStatus,
  );
  const suspendUser = useMutation(api.admin.suspendProfile);
  const unsuspendUser = useMutation(api.admin.unsuspendProfile);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProfile({ id: deleteTarget });
      toast.success(`Deleted ${deleteName}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setDeleteTarget(null);
    setDeleteName("");
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendTarget) return;
    try {
      const days = parseInt(suspendDuration, 10);
      if (isNaN(days) || days <= 0) {
        toast.error("Please enter a valid number of days.");
        return;
      }
      await suspendUser({
        id: suspendTarget,
        reason: suspendReason,
        durationDays: days,
      });
      toast.success(`Suspended ${suspendName} for ${days} days.`);
      setIsSuspendDialogOpen(false);
      setSuspendTarget(null);
      setSuspendReason("");
    } catch (err) {
      toast.error((err as Error).message || "Failed to suspend user");
    }
  };

  const handleUnsuspend = async (id: Id<"profiles">, name: string) => {
    try {
      await unsuspendUser({ id });
      toast.success(`Restored access for ${name}`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to unsuspend user");
    }
  };

  const handleRoleSwitch = async (
    id: Id<"profiles">,
    newRole: "creator" | "brand",
    name: string,
  ) => {
    try {
      await updateRole({ id, role: newRole });
      toast.success(`${name} is now a ${newRole}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all platform users — creators and brands
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["", "creator", "brand"].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              className={`rounded-full ${roleFilter === r ? "gradient-sunset border-0 text-white" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "" ? "All" : r === "creator" ? "Creators" : "Brands"}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 rounded-3xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Followers
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!profiles ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    No users found
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((u) => {
                const totalFollowers =
                  (u.instagramFollowers || 0) +
                  (u.facebookFollowers || 0) +
                  (u.linkedinFollowers || 0) +
                  (u.youtubeFollowers || 0) +
                  (u.quoraFollowers || 0) +
                  (u.twitterFollowers || 0);

                return (
                  <TableRow key={u._id} className="group">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${u.fullName}`
                          }
                          alt=""
                          className="h-9 w-9 rounded-full border border-border object-cover"
                        />
                        <div>
                          <div className="text-sm font-semibold">
                            {u.fullName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {u.handle
                              ? `@${u.handle}`
                              : u.userId?.slice(0, 16) + "…"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                        {u.isSuspended && u.suspendedUntil && u.suspendedUntil > Date.now() && (
                          <Badge
                            variant="destructive"
                            className="rounded-full text-[10px] bg-red-500/10 text-red-600 hover:bg-red-500/10 border border-red-500/20 font-semibold"
                          >
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.category || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.location || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatNumber(totalFollowers)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              handleRoleSwitch(
                                u._id,
                                u.role === "creator" ? "brand" : "creator",
                                u.fullName,
                              )
                            }
                          >
                            Switch to{" "}
                            {u.role === "creator" ? "brand" : "creator"}
                          </DropdownMenuItem>

                          {u.isSuspended && u.suspendedUntil && u.suspendedUntil > Date.now() ? (
                            <DropdownMenuItem
                              className="text-emerald-600 focus:text-emerald-600 cursor-pointer"
                              onClick={() => handleUnsuspend(u._id, u.fullName)}
                            >
                              Unsuspend user
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-amber-600 focus:text-amber-600 cursor-pointer"
                              onClick={() => {
                                setSuspendTarget(u._id);
                                setSuspendName(u.fullName);
                                setSuspendReason("");
                                setSuspendDuration("7");
                                setIsSuspendDialogOpen(true);
                              }}
                            >
                              Suspend user
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => {
                              setDeleteTarget(u._id);
                              setDeleteName(u.fullName);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {profiles && (
          <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
            Showing {profiles.length} user{profiles.length !== 1 && "s"}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete user "{deleteName}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user and all associated data
              including pricing tiers, portfolio images, conversations,
              messages, and favorites. This action cannot be undone.
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
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend User Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              Suspend "{suspendName}"
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Temporarily restrict this user's access to the platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSuspend} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="suspendReason">Reason for Suspension</Label>
              <textarea
                id="suspendReason"
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Inappropriate content, violating campaign agreements"
                className="w-full min-h-[80px] rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="suspendDuration">Suspension Duration (Days)</Label>
              <Input
                id="suspendDuration"
                type="number"
                min="1"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
                placeholder="Number of days"
                className="rounded-xl border-border bg-background"
                required
              />
            </div>

            <DialogFooter className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full flex-1"
                onClick={() => {
                  setIsSuspendDialogOpen(false);
                  setSuspendTarget(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-glow"
              >
                Confirm Suspension
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
