import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, ExternalLink, FileText, RotateCcw, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";

export default function BrandRequests() {
  useEffect(() => {
    document.title = "Brand Requests — Pravixo Admin";
  }, []);

  const pendingBrands = useQuery(api.admin.getPendingBrands);
  const historyBrands = useQuery(api.admin.getBrandVerificationHistory);
  const updateStatus = useMutation(api.admin.updateVerificationStatus);

  const handleAction = async (id: Id<"profiles">, status: "verified" | "rejected", name: string) => {
    try {
      await updateStatus({ id, status });
      toast.success(`Brand ${name} verification request has been ${status === "verified" ? "approved" : "rejected"}.`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update verification status");
    }
  };

  const handleReset = async (id: Id<"profiles">, name: string) => {
    try {
      await updateStatus({ id, status: "unverified" });
      toast.success(`Reset status for ${name} back to Unverified.`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to reset status");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Brand Verification Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review documents submitted by brands (GST) and approve or reject verification applications.
        </p>
      </div>

      {/* PENDING REQUESTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            Pending Applications
            {pendingBrands && pendingBrands.length > 0 && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white rounded-full">
                {pendingBrands.length}
              </Badge>
            )}
          </h2>
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="max-h-[380px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Brand</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>GST Certificate</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!pendingBrands ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-28 rounded-full" /></TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-16 rounded-full" />
                          <Skeleton className="h-8 w-16 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : pendingBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <p className="text-sm text-muted-foreground font-medium">
                        No pending brand verification requests found.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingBrands.map((b) => (
                    <TableRow key={b._id} className="group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              b.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${b.fullName}`
                            }
                            alt=""
                            className="h-9 w-9 rounded-full border border-border object-cover"
                          />
                          <span className="text-sm font-semibold">{b.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {b.handle ? `@${b.handle}` : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {b.gstNumber || "—"}
                      </TableCell>
                      <TableCell>
                        {b.gstCertificateUrl ? (
                          <a
                            href={b.gstCertificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Certificate <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No file</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 px-4 inline-flex items-center gap-1"
                            onClick={() => handleAction(b._id, "verified", b.fullName)}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 font-semibold h-8 px-4 inline-flex items-center gap-1"
                            onClick={() => handleAction(b._id, "rejected", b.fullName)}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pendingBrands && pendingBrands.length > 0 && (
            <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
              Showing {pendingBrands.length} pending request{pendingBrands.length !== 1 && "s"}
            </div>
          )}
        </div>
      </div>

      {/* VERIFICATION HISTORY SECTION */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Verification History</h2>
        
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Brand</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>GST Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!historyBrands ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-8 w-16 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : historyBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground font-medium">
                    No verification history found.
                  </TableCell>
                </TableRow>
              ) : (
                historyBrands.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            b.avatarUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${b.fullName}`
                          }
                          alt=""
                          className="h-9 w-9 rounded-full border border-border object-cover"
                        />
                        <span className="text-sm font-semibold text-muted-foreground">{b.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {b.handle ? `@${b.handle}` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted-foreground">GST: {b.gstNumber || "—"}</span>
                        {b.gstCertificateUrl && (
                          <a
                            href={b.gstCertificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline"
                          >
                            GST Certificate <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {b.verificationStatus === "verified" ? (
                        <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold flex items-center gap-1 w-fit">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 border border-red-500/20 font-semibold flex items-center gap-1 w-fit">
                          <ShieldAlert className="h-3.5 w-3.5" /> Rejected
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                        onClick={() => handleReset(b._id, b.fullName)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {historyBrands && historyBrands.length > 0 && (
            <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
              Total {historyBrands.length} processed request{historyBrands.length !== 1 && "s"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}