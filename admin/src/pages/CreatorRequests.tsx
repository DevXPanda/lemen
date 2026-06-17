export default function CreatorRequests() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Creator Verification Requests</h1>
        <p className="text-muted-foreground">
          Review creator verification applications.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p>No creator verification requests found.</p>
      </div>
    </div>
  );
}