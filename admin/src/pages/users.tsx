import { useEffect, useState } from "react";
import { Search, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const profiles = useQuery(api.profiles.list, {
    search: search || undefined,
    role: roleFilter || undefined,
  });

  const deleteProfile = useMutation(api.admin.deleteProfile);
  const updateRole = useMutation(api.admin.updateProfileRole);

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
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl"
                        >
                          <DropdownMenuItem
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
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
    </div>
  );
}
