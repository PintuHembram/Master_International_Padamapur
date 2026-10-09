import {
  CONSENT_EXPIRY_DAYS,
  CONSENT_POLICY_VERSION,
  CONSENT_STORAGE_KEY,
  DEFAULT_CATEGORIES,
  type ConsentCategories,
} from "@/lib/consent/config";
import { syncConsentServices } from "@/lib/consent/scriptRegistry";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ConsentRecord {
  version: string;
  timestamp: number;
  categories: ConsentCategories;
}

interface CookieConsentContextValue {
  /** True once the visitor has made a valid, unexpired choice. */
  hasConsented: boolean;
  categories: ConsentCategories;
  /** Open the preference modal (used by the footer "Cookie Settings" link). */
  openSettings: () => void;
  closeSettings: () => void;
  settingsOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (categories: ConsentCategories) => void;
  /** Withdraw all optional consent. */
  withdrawConsent: () => void;
  /** Clear the stored choice entirely (testing / re-consent). */
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

function isRecordValid(record: ConsentRecord | null): record is ConsentRecord {
  if (!record) return false;
  if (record.version !== CONSENT_POLICY_VERSION) return false;
  if (typeof record.timestamp !== "number") return false;
  const ageMs = Date.now() - record.timestamp;
  return ageMs >= 0 && ageMs < CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

function readStoredConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    // Validate user-controlled data strictly — never trust stored shape.
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.version !== "string" ||
      typeof parsed.timestamp !== "number" ||
      typeof parsed.categories !== "object" ||
      parsed.categories === null
    ) {
      return null;
    }
    const categories: ConsentCategories = {
      necessary: true,
      functional: parsed.categories.functional === true,
      analytics: parsed.categories.analytics === true,
      marketing: parsed.categories.marketing === true,
    };
    const record: ConsentRecord = {
      version: parsed.version,
      timestamp: parsed.timestamp,
      categories,
    };
    return isRecordValid(record) ? record : null;
  } catch {
    return null;
  }
}

function writeStoredConsent(categories: ConsentCategories) {
  const record: ConsentRecord = {
    version: CONSENT_POLICY_VERSION,
    timestamp: Date.now(),
    categories,
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Unable to store cookie preferences.", error);
  }
  syncConsentServices(categories);
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [record, setRecord] = useState<ConsentRecord | null>(() => readStoredConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Activate any already-consented services on load (none are registered
  // unless an administrator has verified and added them).
  useEffect(() => {
    if (record) syncConsentServices(record.categories);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((categories: ConsentCategories) => {
    writeStoredConsent(categories);
    setRecord({ version: CONSENT_POLICY_VERSION, timestamp: Date.now(), categories });
  }, []);

  const acceptAll = useCallback(() => {
    persist({ necessary: true, functional: true, analytics: true, marketing: true });
    setSettingsOpen(false);
  }, [persist]);

  const rejectNonEssential = useCallback(() => {
    persist({ ...DEFAULT_CATEGORIES });
    setSettingsOpen(false);
  }, [persist]);

  const savePreferences = useCallback(
    (categories: ConsentCategories) => {
      persist({ ...categories, necessary: true });
      setSettingsOpen(false);
    },
    [persist],
  );

  const withdrawConsent = useCallback(() => {
    persist({ ...DEFAULT_CATEGORIES });
  }, [persist]);

  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setRecord(null);
    setSettingsOpen(false);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      hasConsented: record !== null,
      categories: record?.categories ?? DEFAULT_CATEGORIES,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      settingsOpen,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      withdrawConsent,
      resetConsent,
    }),
    [record, settingsOpen, acceptAll, rejectNonEssential, savePreferences, withdrawConsent, resetConsent],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}
