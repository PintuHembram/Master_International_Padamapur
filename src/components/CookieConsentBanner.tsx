import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import type { ConsentCategories } from "@/lib/consent/config";
import { Cookie, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface CategoryMeta {
  key: keyof ConsentCategories;
  name: string;
  description: string;
  essential: boolean;
}

const CATEGORY_META: CategoryMeta[] = [
  {
    key: "necessary",
    name: "Strictly Necessary",
    description:
      "Required for the website to function: security, sign-in sessions for the staff, student and admission portals, and remembering your cookie choice itself. These cannot be switched off.",
    essential: true,
  },
  {
    key: "functional",
    name: "Functional",
    description:
      "Remember your preferences, such as light/dark display mode and dismissing optional pop-ups, to make repeat visits more convenient.",
    essential: false,
  },
  {
    key: "analytics",
    name: "Analytics",
    description:
      "Help us understand visitor traffic and website usage patterns. No analytics services are currently active on this website; enabling this category only permits them in future after administrative review.",
    essential: false,
  },
  {
    key: "marketing",
    name: "Advertising & Marketing",
    description:
      "Used to measure campaigns and personalise advertising. This website does not use advertising or marketing trackers, and children's information is never used for advertising or profiling.",
    essential: false,
  },
];

export function CookieConsentBanner() {
  const {
    hasConsented,
    categories,
    settingsOpen,
    openSettings,
    closeSettings,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    resetConsent,
  } = useCookieConsent();

  const [draft, setDraft] = useState<ConsentCategories>(categories);

  // Keep the modal's draft in sync whenever it is opened.
  useEffect(() => {
    if (settingsOpen) setDraft(categories);
  }, [settingsOpen, categories]);

  return (
    <>
      {/* Consent banner — only shown until a valid choice exists */}
      {!hasConsented && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-6 pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl bg-navy text-white shadow-2xl border border-white/10">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">We Value Your Privacy</h2>
                  <p className="text-white/80 text-sm leading-relaxed mt-1">
                    Master International School, Padamapur uses cookies and similar technologies to help our
                    website function properly, remember your preferences, improve your browsing experience, and
                    understand website usage where permitted. You can accept all cookies, reject non-essential
                    cookies, or customise your preferences.
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/60 mb-4">
                Read our{" "}
                <Link to="/cookie-policy" className="text-gold hover:underline font-medium">
                  Cookie Policy
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-gold hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={acceptAll}
                  className="bg-gold text-navy hover:bg-gold-dark font-semibold flex-1 sm:flex-none"
                >
                  Accept All
                </Button>
                <Button
                  onClick={rejectNonEssential}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white flex-1 sm:flex-none"
                >
                  Reject Non-Essential
                </Button>
                <Button
                  onClick={openSettings}
                  variant="ghost"
                  className="text-gold hover:bg-white/10 hover:text-gold flex-1 sm:flex-none"
                >
                  Cookie Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences modal */}
      <Dialog open={settingsOpen} onOpenChange={(open) => (open ? openSettings() : closeSettings())}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <ShieldCheck className="w-5 h-5 text-gold" aria-hidden="true" />
              Cookie Settings
            </DialogTitle>
            <DialogDescription>
              Choose which optional cookies and similar technologies this website may use. Strictly necessary
              items are always active because the website cannot function without them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {CATEGORY_META.map((category) => (
              <div key={category.key} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    {category.essential && (
                      <Badge variant="secondary" className="text-xs">
                        Always Active
                      </Badge>
                    )}
                  </div>
                  <Switch
                    aria-label={`${category.name} cookies`}
                    checked={category.essential ? true : draft[category.key]}
                    disabled={category.essential}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({ ...prev, [category.key]: checked }))
                    }
                  />
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed mt-2">{category.description}</p>
              </div>
            ))}
          </div>

          <Separator />

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button onClick={() => savePreferences(draft)} className="bg-gold text-navy hover:bg-gold-dark font-semibold flex-1">
                Save My Preferences
              </Button>
              <Button onClick={acceptAll} variant="outline" className="flex-1">
                Accept All
              </Button>
              <Button onClick={rejectNonEssential} variant="outline" className="flex-1">
                Reject Non-Essential
              </Button>
            </div>
            <div className="flex items-center justify-between w-full pt-1">
              <Link to="/cookie-policy" className="text-xs text-muted-foreground hover:text-gold underline" onClick={closeSettings}>
                Read our Cookie Policy
              </Link>
              <button
                type="button"
                onClick={resetConsent}
                className="text-xs text-muted-foreground hover:text-destructive underline"
              >
                Reset preferences (testing)
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CookieConsentBanner;
