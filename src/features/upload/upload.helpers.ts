export function createImageFormData(file: Blob | string, name = "image.jpg", type = "image/jpeg") {
  const formData = new FormData();

  if (typeof file === "string") {
    formData.append("file", file);
    return formData;
  }

  formData.append("file", file, file instanceof File ? file.name : name);
  return formData;
}
