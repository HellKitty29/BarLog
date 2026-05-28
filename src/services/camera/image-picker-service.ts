import * as ImagePicker from "expo-image-picker";

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.9
};

export async function takePhotoWithCamera() {
  return ImagePicker.launchCameraAsync(imagePickerOptions);
}

export async function pickImageFromLibrary() {
  return ImagePicker.launchImageLibraryAsync(imagePickerOptions);
}
