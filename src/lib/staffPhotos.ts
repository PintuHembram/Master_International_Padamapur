import { supabase } from '@/integrations/supabase/client';

const STAFF_PHOTO_BUCKET = 'staff-photos';

export function staffPhotoPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value;

  try {
    const pathname = new URL(value).pathname;
    const marker = `/${STAFF_PHOTO_BUCKET}/`;
    const markerIndex = pathname.indexOf(marker);
    return markerIndex < 0 ? null : decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function createStaffPhotoUrl(value: string | null | undefined): Promise<string | null> {
  const path = staffPhotoPath(value);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(STAFF_PHOTO_BUCKET)
    .createSignedUrl(path, 60 * 60);

  return error ? null : data.signedUrl;
}