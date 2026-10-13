import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { Pencil, Plus, Trash2, UserRound } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type StaffRecord = Tables<'staff'>;
const PHOTO_BUCKET = 'staff-photos';
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type StaffForm = {
  name: string;
  email: string;
  employee_code: string;
  designation: string;
  department: string;
  phone: string;
  joining_year: string;
  photo_url: string;
  subject: string;
  assigned_class: string;
};

const emptyForm: StaffForm = {
  name: '',
  email: '',
  employee_code: '',
  designation: '',
  department: '',
  phone: '',
  joining_year: '',
  photo_url: '',
  subject: '',
  assigned_class: '',
};

const toForm = (record: StaffRecord): StaffForm => ({
  name: record.name,
  email: record.email ?? '',
  employee_code: record.employee_code,
  designation: record.designation ?? '',
  department: record.department ?? '',
  phone: record.phone ?? '',
  joining_year: record.joining_year?.toString() ?? '',
  photo_url: record.photo_url ?? '',
  subject: record.subject ?? '',
  assigned_class: record.assigned_class ?? '',
});

export default function ErpStaff() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('name');
    if (error) {
      toast.error(`Unable to load staff: ${error.message}`);
    } else {
      setStaff(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  const openNewStaff = () => {
    setEditingStaff(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const openEditStaff = (record: StaffRecord) => {
    setEditingStaff(record);
    setForm(toForm(record));
    setPhotoFile(null);
    setDialogOpen(true);
  };

  const selectPhoto = (file: File | undefined) => {
    setPhotoFile(null);
    if (!file) return;
    if (!Object.hasOwn(PHOTO_EXTENSIONS, file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error('Profile photos must be 5 MB or smaller.');
      if (photoInputRef.current) photoInputRef.current.value = '';
      return;
    }
    setPhotoFile(file);
  };

  const updateField = (field: keyof StaffForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveStaff = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.employee_code.trim()) {
      toast.error('Teacher/staff name and employee ID are required.');
      return;
    }
    if (form.joining_year && !/^\d{4}$/.test(form.joining_year)) {
      toast.error('Enter the joining year as a four-digit year.');
      return;
    }

    const staffId = editingStaff?.id ?? crypto.randomUUID();
    const payload: TablesInsert<'staff'> = {
      id: staffId,
      name: form.name.trim(),
      email: form.email.trim() || null,
      employee_code: form.employee_code.trim(),
      designation: form.designation.trim() || null,
      department: form.department.trim() || null,
      phone: form.phone.trim() || null,
      joining_year: form.joining_year ? Number(form.joining_year) : null,
      photo_url: form.photo_url || null,
      subject: form.subject.trim() || null,
      assigned_class: form.assigned_class.trim() || null,
    };

    setSaving(true);
    const { data: savedStaff, error } = editingStaff
      ? await supabase.from('staff').update(payload).eq('id', staffId).select().single()
      : await supabase.from('staff').insert(payload).select().single();

    if (error) {
      setSaving(false);
      toast.error(`Unable to save staff profile: ${error.message}`);
      return;
    }

    setEditingStaff(savedStaff);

    if (photoFile) {
      const extension = PHOTO_EXTENSIONS[photoFile.type];
      const path = `${staffId}/profile.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, photoFile, { upsert: true, contentType: photoFile.type });

      if (uploadError) {
        setSaving(false);
        toast.error(`Profile details were saved, but photo upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      const photoUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      const { data: updatedStaff, error: photoUpdateError } = await supabase
        .from('staff')
        .update({ photo_url: photoUrl })
        .eq('id', staffId)
        .select()
        .single();

      if (photoUpdateError) {
        setSaving(false);
        toast.error(`Photo uploaded, but the profile could not be updated: ${photoUpdateError.message}`);
        return;
      }

      setEditingStaff(updatedStaff);
      setForm((current) => ({ ...current, photo_url: photoUrl }));
    }

    setSaving(false);
    setPhotoFile(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    setDialogOpen(false);
    toast.success(editingStaff ? 'Staff profile updated.' : 'Staff profile created.');
    await fetchStaff();
  };

  const deleteStaff = async (record: StaffRecord) => {
    if (!window.confirm(`Delete the staff profile for ${record.name}?`)) return;
    const { error } = await supabase.from('staff').delete().eq('id', record.id);
    if (error) {
      toast.error(`Unable to delete staff profile: ${error.message}`);
      return;
    }
    toast.success('Staff profile deleted.');
    await fetchStaff();
  };

  const fields: { key: keyof StaffForm; label: string; type?: string; required?: boolean; placeholder?: string }[] = [
    { key: 'name', label: 'Teacher / Staff name', required: true },
    { key: 'employee_code', label: 'Employee ID', required: true },
    { key: 'email', label: 'Sign-in email', type: 'email', placeholder: 'Must match the teacher sign-in email' },
    { key: 'joining_year', label: 'Joining year', type: 'number', placeholder: 'e.g. 2022' },
    { key: 'designation', label: 'Designation', placeholder: 'e.g. Mathematics Teacher' },
    { key: 'department', label: 'Department' },
    { key: 'subject', label: 'Subject taught', placeholder: 'e.g. Mathematics' },
    { key: 'assigned_class', label: 'Class / section', placeholder: 'e.g. Class 8-A' },
    { key: 'phone', label: 'Phone', type: 'tel' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Staff & Teacher Profiles</h2>
          <p className="text-sm text-muted-foreground">
            Manage teacher sign-in details, employee IDs, teaching assignments, and profile photos.
          </p>
        </div>
        <Button onClick={openNewStaff}>
          <Plus className="mr-2 h-4 w-4" />
          Add staff profile
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading staff profiles…</p>
      ) : staff.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No staff profiles yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((record) => {
            const initials = record.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
            return (
              <Card key={record.id}>
                <CardContent className="flex gap-4 p-5">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={record.photo_url ?? undefined} alt={record.name} />
                    <AvatarFallback>{initials || <UserRound className="h-6 w-6" />}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{record.name}</h3>
                    <p className="text-sm text-muted-foreground">{record.designation || 'Staff'}</p>
                    <p className="mt-2 text-sm">Employee ID: <span className="font-medium">{record.employee_code}</span></p>
                    <p className="text-sm">Joining year: {record.joining_year ?? 'Not provided'}</p>
                    <p className="text-sm">Subject: {record.subject || record.department || 'Not assigned'}</p>
                    <p className="text-sm">Class: {record.assigned_class || 'Not assigned'}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditStaff(record)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => void deleteStaff(record)} aria-label={`Delete ${record.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit staff profile' : 'Add staff profile'}</DialogTitle>
            <DialogDescription>
              For teacher dashboard matching, use the same email address as the teacher’s sign-in account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveStaff} className="space-y-4">
            {(photoPreview || form.photo_url) && (
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={photoPreview || form.photo_url} alt="Profile preview" />
                  <AvatarFallback><UserRound className="h-6 w-6" /></AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">Profile photo preview</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="staff-photo">Profile photo</Label>
              <Input
                ref={photoInputRef}
                id="staff-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => selectPhoto(event.target.files?.[0])}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum size: 5 MB.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ key, label, type = 'text', required, placeholder }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`staff-${key}`}>{label}{required ? ' *' : ''}</Label>
                  <Input
                    id={`staff-${key}`}
                    type={type}
                    value={form[key]}
                    onChange={(event) => updateField(key, event.target.value)}
                    placeholder={placeholder}
                    required={required}
                    min={key === 'joining_year' ? 1900 : undefined}
                    max={key === 'joining_year' ? new Date().getFullYear() : undefined}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
