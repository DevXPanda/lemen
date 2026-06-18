import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Schedule automated social analytics sync job every 12 hours
crons.interval(
  "automated-social-sync",
  { hours: 12 },
  api.socialAction.syncAllConnectionsAction,
  {}
);

export default crons;
