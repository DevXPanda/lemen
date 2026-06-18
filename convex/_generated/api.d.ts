/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as campaigns from "../campaigns.js";
import type * as connections from "../connections.js";
import type * as crons from "../crons.js";
import type * as messages from "../messages.js";
import type * as otp from "../otp.js";
import type * as otpAction from "../otpAction.js";
import type * as portfolio from "../portfolio.js";
import type * as pricing from "../pricing.js";
import type * as profiles from "../profiles.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as social from "../social.js";
import type * as socialAction from "../socialAction.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  campaigns: typeof campaigns;
  connections: typeof connections;
  crons: typeof crons;
  messages: typeof messages;
  otp: typeof otp;
  otpAction: typeof otpAction;
  portfolio: typeof portfolio;
  pricing: typeof pricing;
  profiles: typeof profiles;
  reviews: typeof reviews;
  seed: typeof seed;
  social: typeof social;
  socialAction: typeof socialAction;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
