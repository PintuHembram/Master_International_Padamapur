/**
 * Central cookie-consent configuration for Master International School, Padamapur.
 *
 * ADMIN VERIFICATION REQUIRED BEFORE CHANGES GO LIVE:
 * - Bump CONSENT_POLICY_VERSION whenever the Cookie Policy text or the cookie
 *   inventory changes. A version bump automatically asks every visitor to
 *   re-confirm their preferences.
 * - The inventory below was compiled by inspecting the actual codebase
 *   (index.html + src/). Only technologies that are really implemented are
 *   listed. Do NOT add analytics, advertising or tracking providers here
 *   unless they have actually been integrated and reviewed.
 */

export const CONSENT_POLICY_VERSION = "1.0";
export const CONSENT_POLICY_LAST_UPDATED = "9 October 2026";

/** Days after which a visitor is asked to re-confirm consent. */
export const CONSENT_EXPIRY_DAYS = 180;

export const CONSENT_STORAGE_KEY = "mis-cookie-consent";

export type OptionalConsentCategory = "functional" | "analytics" | "marketing";

export interface ConsentCategories {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const DEFAULT_CATEGORIES: ConsentCategories = {
  necessary: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export interface CookieInventoryItem {
  name: string;
  type: "Cookie" | "Local storage" | "Session storage";
  category: "Strictly necessary" | "Functional" | "Analytics" | "Advertising & marketing";
  purpose: string;
  duration: string;
}

/**
 * Verified inventory — every entry below corresponds to storage that exists
 * in the current implementation. No analytics or advertising technologies
 * are active on this website.
 */
export const COOKIE_INVENTORY: CookieInventoryItem[] = [
  {
    name: "mis-cookie-consent",
    type: "Local storage",
    category: "Strictly necessary",
    purpose: "Remembers your cookie preferences so the consent banner is not shown again until consent expires or the policy version changes.",
    duration: `${CONSENT_EXPIRY_DAYS} days`,
  },
  {
    name: "sb-<project>-auth-token",
    type: "Local storage",
    category: "Strictly necessary",
    purpose: "Keeps staff and administrators securely signed in to the school portal (authentication session).",
    duration: "Until sign-out",
  },
  {
    name: "studentSession",
    type: "Session storage",
    category: "Strictly necessary",
    purpose: "Keeps a student signed in to the student portal during the visit.",
    duration: "Current browser session only",
  },
  {
    name: "admissionSession",
    type: "Session storage",
    category: "Strictly necessary",
    purpose: "Lets an admission applicant resume an in-progress application during the visit.",
    duration: "Current browser session only",
  },
  {
    name: "mis-visitor-counted / mis-visitor-count",
    type: "Session storage",
    category: "Strictly necessary",
    purpose: "Prevents the website visitor counter from counting the same visit repeatedly.",
    duration: "Current browser session only",
  },
  {
    name: "theme",
    type: "Local storage",
    category: "Functional",
    purpose: "Remembers your light/dark display preference.",
    duration: "Until changed",
  },
  {
    name: "sidebar_state",
    type: "Cookie",
    category: "Functional",
    purpose: "Remembers whether the administration sidebar is open or closed.",
    duration: "7 days",
  },
  {
    name: "pwa-never-show",
    type: "Local storage",
    category: "Functional",
    purpose: "Remembers your choice not to see the app-install banner again.",
    duration: "Until cleared",
  },
  {
    name: "importantNewsSeen",
    type: "Local storage",
    category: "Functional",
    purpose: "Prevents the important-news popup from reopening after you have seen it.",
    duration: "Until cleared",
  },
];
