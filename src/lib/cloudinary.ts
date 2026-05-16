interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  // Basic validation
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File is too large. Max size is 10MB.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  form.append("folder", folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form },
    );

    if (!res.ok) {
      let detail = "";
      try {
        const data = await res.json();
        detail = data?.error?.message || "";
      } catch {
        // ignore
      }

      // If cloudName looks like an API Key (numeric), provide a hint
      if (/^\d+$/.test(cloudName)) {
        throw new Error(
          `Cloudinary upload failed: ${detail || "Unknown error"}. Note: Your cloud name looks like an API Key. Ensure you use the "Cloud Name" from your Cloudinary dashboard.`,
        );
      }

      throw new Error(
        detail ? `Cloudinary upload failed: ${detail}` : "Cloudinary upload failed",
      );
    }

    const data = (await res.json()) as CloudinaryUploadResult;
    return data.secure_url;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("An unexpected error occurred during upload");
  }
}
