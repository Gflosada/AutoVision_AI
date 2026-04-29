import { getSupabaseClient } from "./client";

const VEHICLE_BUCKET = "vehicle-originals";

export async function uploadVehicleOriginal(input: { userId: string; file: File }) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const extension = input.file.name.split(".").pop() || "jpg";
  const path = `${input.userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(VEHICLE_BUCKET).upload(path, input.file, {
    cacheControl: "3600",
    upsert: false,
    contentType: input.file.type,
  });

  if (error) {
    const hint = error.message.toLowerCase().includes("row-level security")
      ? " Supabase Storage RLS blocked this upload. Add storage.objects policies for the vehicle-originals bucket."
      : "";
    throw new Error(`${error.message}.${hint}`);
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(VEHICLE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signedError) {
    const { data: publicUrl } = supabase.storage.from(VEHICLE_BUCKET).getPublicUrl(path);
    return publicUrl.publicUrl;
  }

  return signed.signedUrl;
}
