export function createImageFormData(file: Blob | string, name = "image.jpg", type = "image/jpeg") {
  const formData = new FormData();

  if (typeof file === "string") {
    formData.append("file", file);
    return formData;
  }

  formData.append("file", file, file instanceof File ? file.name : name);
  return formData;
}

export async function compressImageForUpload(
  blob: Blob,
  maxDimension = 1600,
  quality = 0.82
): Promise<Blob> {
  if (typeof createImageBitmap !== "function") {
    return blob;
  }

  try {
    const bitmap = await createImageBitmap(blob);
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longestEdge > maxDimension ? maxDimension / longestEdge : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const compressed = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (next) => (next ? resolve(next) : reject(new Error("Image compression failed."))),
        "image/jpeg",
        quality
      );
    });

    return compressed.size < blob.size ? compressed : blob;
  } catch {
    return blob;
  }
}
