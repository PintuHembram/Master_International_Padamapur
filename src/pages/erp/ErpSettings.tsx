import { FormEvent, useState } from "react";
import { Building2, CalendarDays, Check, Plus, Save, School } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ErpSettings,
  type SchoolProfile,
  saveErpSettings,
  useErpSettings,
} from "@/lib/erpSettings";

const fieldClassName = "grid gap-2";

function saveSettings(settings: ErpSettings) {
  try {
    saveErpSettings(settings);
  } catch (error) {
    console.error("Failed to save ERP settings", error);
    toast.error("Settings could not be saved. Check browser storage and try again.");
  }
}

export default function ErpSettingsPage() {
  const settings = useErpSettings();
  const [yearInput, setYearInput] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolUdise, setNewSchoolUdise] = useState("");
  const [newSchoolAddress, setNewSchoolAddress] = useState("");
  const activeSchool = settings.schools.find((school) => school.id === settings.activeSchoolId);

  if (!activeSchool) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive" role="alert">
        The selected school is missing from saved ERP settings. Please select another school or clear the saved settings.
      </div>
    );
  }

  const updateSchool = (patch: Partial<SchoolProfile>) => {
    saveSettings({
      ...settings,
      schools: settings.schools.map((school) =>
        school.id === activeSchool.id ? { ...school, ...patch } : school,
      ),
    });
  };

  const addAcademicYear = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = yearInput.trim();
    if (!/^\d{4}-\d{2}$/.test(label)) {
      toast.error("Enter an academic year in YYYY-YY format, such as 2026-27.");
      return;
    }
    if (settings.academicYears.some((year) => year.id === label)) {
      toast.error("That academic year already exists.");
      return;
    }
    saveSettings({
      ...settings,
      academicYears: [...settings.academicYears, { id: label, label }].sort((a, b) => a.label.localeCompare(b.label)),
    });
    setYearInput("");
  };

  const addSchool = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newSchoolName.trim();
    if (!name) {
      toast.error("Enter a school name.");
      return;
    }
    const school: SchoolProfile = {
      id: `school-${Date.now()}`,
      name,
      udiseCode: newSchoolUdise.trim(),
      category: "Primary with Upper Primary",
      schoolType: "Co-educational",
      address: newSchoolAddress.trim(),
      phone: "",
      email: "",
    };
    saveSettings({ ...settings, schools: [...settings.schools, school] });
    setNewSchoolName("");
    setNewSchoolUdise("");
    setNewSchoolAddress("");
    toast.success(`${name} added to this device.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your school profile, academic year, and school locations.</p>
      </div>

      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
        These settings are saved in this browser only. Server-side ERP synchronization is not connected yet.
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="gap-2"><School className="h-4 w-4" /> School profile</TabsTrigger>
          <TabsTrigger value="years" className="gap-2"><CalendarDays className="h-4 w-4" /> Academic year</TabsTrigger>
          <TabsTrigger value="schools" className="gap-2"><Building2 className="h-4 w-4" /> Multi-school</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">School profile</CardTitle>
              <CardDescription>Update the details shown in the ERP school header.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className={fieldClassName}>
                  <Label htmlFor="school-name">School name</Label>
                  <Input id="school-name" value={activeSchool.name} onChange={(event) => updateSchool({ name: event.target.value })} />
                </div>
                <div className={fieldClassName}>
                  <Label htmlFor="udise-code">UDISE code</Label>
                  <Input id="udise-code" value={activeSchool.udiseCode} onChange={(event) => updateSchool({ udiseCode: event.target.value })} />
                </div>
                <div className={fieldClassName}>
                  <Label htmlFor="school-category">School category</Label>
                  <Input id="school-category" value={activeSchool.category} onChange={(event) => updateSchool({ category: event.target.value })} />
                </div>
                <div className={fieldClassName}>
                  <Label htmlFor="school-type">School type</Label>
                  <Input id="school-type" value={activeSchool.schoolType} onChange={(event) => updateSchool({ schoolType: event.target.value })} />
                </div>
                <div className={fieldClassName}>
                  <Label htmlFor="school-phone">Contact phone</Label>
                  <Input id="school-phone" type="tel" value={activeSchool.phone} onChange={(event) => updateSchool({ phone: event.target.value })} />
                </div>
                <div className={fieldClassName}>
                  <Label htmlFor="school-email">Contact email</Label>
                  <Input id="school-email" type="email" value={activeSchool.email} onChange={(event) => updateSchool({ email: event.target.value })} />
                </div>
                <div className={`${fieldClassName} sm:col-span-2`}>
                  <Label htmlFor="school-address">School address</Label>
                  <Input id="school-address" value={activeSchool.address} onChange={(event) => updateSchool({ address: event.target.value })} />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-4 w-4 text-green-600" /> Changes are saved automatically.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="years">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic years</CardTitle>
              <CardDescription>Choose which academic year is active across the ERP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={addAcademicYear} className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="new-academic-year">Add academic year</Label>
                  <Input id="new-academic-year" value={yearInput} onChange={(event) => setYearInput(event.target.value)} placeholder="2026-27" />
                </div>
                <Button type="submit" className="sm:mt-7"><Plus className="h-4 w-4" /> Add year</Button>
              </form>
              <div className="divide-y rounded-md border">
                {settings.academicYears.map((year) => {
                  const isActive = year.id === settings.activeAcademicYearId;
                  return (
                    <div key={year.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="font-medium">{year.label}</div>
                      {isActive ? (
                        <Badge variant="secondary">Active year</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveSettings({ ...settings, activeAcademicYearId: year.id })}
                        >
                          Set active
                        </Button>
                      )}
                    </div>
                  );
                })}
                {settings.academicYears.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">No academic years yet. Add one above to get started.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schools</CardTitle>
                <CardDescription>Select the school context used by this ERP session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {settings.schools.map((school) => {
                  const isActive = school.id === settings.activeSchoolId;
                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => saveSettings({ ...settings, activeSchoolId: school.id })}
                      className={`flex w-full items-center justify-between gap-4 rounded-md border p-4 text-left transition-colors hover:bg-muted/50 ${isActive ? "border-primary bg-primary/5" : ""}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{school.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {school.udiseCode ? `UDISE ${school.udiseCode}` : "UDISE code not set"}
                          {school.address ? ` · ${school.address}` : ""}
                        </span>
                      </span>
                      {isActive && <Badge variant="secondary">Current</Badge>}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add a school</CardTitle>
                <CardDescription>Add another school to switch between in this browser.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addSchool} className="space-y-4">
                  <div className={fieldClassName}>
                    <Label htmlFor="new-school-name">School name</Label>
                    <Input id="new-school-name" value={newSchoolName} onChange={(event) => setNewSchoolName(event.target.value)} required />
                  </div>
                  <div className={fieldClassName}>
                    <Label htmlFor="new-school-udise">UDISE code</Label>
                    <Input id="new-school-udise" value={newSchoolUdise} onChange={(event) => setNewSchoolUdise(event.target.value)} />
                  </div>
                  <div className={fieldClassName}>
                    <Label htmlFor="new-school-address">Address</Label>
                    <Input id="new-school-address" value={newSchoolAddress} onChange={(event) => setNewSchoolAddress(event.target.value)} />
                  </div>
                  <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Add school</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Save className="h-3.5 w-3.5" /> Browser-local settings are not shared across users or devices.
      </div>
    </div>
  );
}
