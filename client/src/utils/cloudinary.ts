import axios from "axios";

// Cloudinary configuration from environment variables
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

/**
 * Upload an image file to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder path in Cloudinary (default: "edupath")
 * @returns Promise<string> - The secure URL of the uploaded image
 */
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = "edupath"
): Promise<string> => {
  // Validate configuration
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration is missing. Please check your .env file."
    );
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar");
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran gambar maksimal 5MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder); // Organize uploads in specified folder

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message || error.message;
      throw new Error(`Gagal mengupload gambar: ${errorMessage}`);
    }
    throw new Error("Gagal mengupload gambar");
  }
};

/**
 * Parse message text to extract image URL if present
 * Supports both old format [IMAGE]url and new format with direct Cloudinary URLs
 * @param message - The message text that may contain image URL
 * @returns Object with imageUrl and textMessage
 */
export const parseMessageWithImage = (message: string) => {
  // Check for old format [IMAGE]url (for backward compatibility)
  const oldFormatMatch = message.match(/\[IMAGE\](https?:\/\/[^\s]+)/);
  if (oldFormatMatch) {
    const imageUrl = oldFormatMatch[1];
    const textMessage = message
      .replace(/\[IMAGE\]https?:\/\/[^\s]+/, "")
      .trim();
    return { imageUrl, textMessage };
  }

  // Check for direct Cloudinary URL (new format)
  const cloudinaryMatch = message.match(
    /(https?:\/\/res\.cloudinary\.com\/[^\s]+)/
  );
  if (cloudinaryMatch) {
    const imageUrl = cloudinaryMatch[1];
    const textMessage = message.replace(imageUrl, "").trim();
    return { imageUrl, textMessage };
  }

  // No image found
  return { imageUrl: null, textMessage: message };
};
