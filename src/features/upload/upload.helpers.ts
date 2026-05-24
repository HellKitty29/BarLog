export function createImageFormData(uri: string, name = "image.jpg", type = "image/jpeg") {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name,
    type
  } as unknown as Blob);
  return formData;
}
