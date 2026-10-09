import { useEffect, useState } from "react";

export type SchoolProfile = {
  id: string;
  name: string;
  udiseCode: string;
  category: string;
  schoolType: string;
  address: string;
  phone: string;
  email: string;
};

export type AcademicYear = {
  id: string;
  label: string;
};

export type ErpSettings = {
  schools: SchoolProfile[];
  activeSchoolId: string;
  academicYears: AcademicYear[];
  activeAcademicYearId: string;
};

const STORAGE_KEY = "master-international-erp-settings";
const SETTINGS_EVENT = "master-international-erp-settings-updated";

export const DEFAULT_ERP_SETTINGS: ErpSettings = {
  schools: [
    {
      id: "main-school",
      name: "Master International School",
      udiseCode: "21061400252",
      category: "Primary with Upper Primary",
      schoolType: "Co-educational",
      address: "",
      phone: "",
      email: "",
    },
  ],
  activeSchoolId: "main-school",
  academicYears: [
    { id: "2024-25", label: "2024-25" },
    { id: "2025-26", label: "2025-26" },
  ],
  activeAcademicYearId: "2025-26",
};

export function loadErpSettings(): ErpSettings {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_ERP_SETTINGS;

  const parsed: unknown = JSON.parse(stored);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("schools" in parsed) ||
    !Array.isArray(parsed.schools) ||
    !("academicYears" in parsed) ||
    !Array.isArray(parsed.academicYears) ||
    !("activeSchoolId" in parsed) ||
    typeof parsed.activeSchoolId !== "string" ||
    !("activeAcademicYearId" in parsed) ||
    typeof parsed.activeAcademicYearId !== "string"
  ) {
    throw new Error("Saved ERP settings are invalid. Clear the saved settings and try again.");
  }
  return parsed as ErpSettings;
}

export function saveErpSettings(settings: ErpSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent<ErpSettings>(SETTINGS_EVENT, { detail: settings }));
}

export function useErpSettings(): ErpSettings {
  const [settings, setSettings] = useState(loadErpSettings);

  useEffect(() => {
    const update = (event: Event) => {
      setSettings((event as CustomEvent<ErpSettings>).detail);
    };
    window.addEventListener(SETTINGS_EVENT, update);
    return () => window.removeEventListener(SETTINGS_EVENT, update);
  }, []);

  return settings;
}
