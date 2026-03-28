// Cloudinary upload utility - provider-ready pattern
// All secrets come from environment variables

interface UploadResult {
  url: string;
  publicId: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "hoj_hostel"); // Create this preset in Cloudinary dashboard
  formData.append("folder", "hoj-hostel");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured");
  }

  // In production, use the Cloudinary Node SDK for signed deletions:
  // const cloudinary = require('cloudinary').v2;
  // cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  // await cloudinary.uploader.destroy(publicId);

  console.log(`[Upload] Would delete image: ${publicId}`);
}
