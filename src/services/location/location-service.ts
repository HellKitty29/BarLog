import * as Location from "expo-location";
import { Platform } from "react-native";
import { requestLocationPermissionState } from "./location-permission";

export type Coordinates = {
  lat: number;
  lng: number;
};

export type LocationAccessErrorCode = "permission_denied" | "permission_blocked" | "services_disabled";

export class LocationAccessError extends Error {
  code: LocationAccessErrorCode;

  constructor(code: LocationAccessErrorCode, message: string) {
    super(message);
    this.name = "LocationAccessError";
    this.code = code;
  }
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  const permission = await requestLocationPermissionState();

  if (!permission.granted) {
    throw new LocationAccessError(
      permission.canAskAgain ? "permission_denied" : "permission_blocked",
      permission.canAskAgain
        ? "Location permission was not granted."
        : "Location permission is blocked in system settings."
    );
  }

  let servicesEnabled = await Location.hasServicesEnabledAsync();

  if (!servicesEnabled && Platform.OS === "android") {
    try {
      await Location.enableNetworkProviderAsync();
      servicesEnabled = await Location.hasServicesEnabledAsync();
    } catch {
      servicesEnabled = false;
    }
  }

  if (!servicesEnabled) {
    throw new LocationAccessError("services_disabled", "Location services are disabled.");
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
}
