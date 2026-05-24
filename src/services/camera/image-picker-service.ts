import * as ImagePicker from "expo-image-picker";

export async function pickImageFromLibrary() {
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.9
  });
}
