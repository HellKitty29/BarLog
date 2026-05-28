import * as Location from "expo-location";

export type LocationPermissionResult = {
  canAskAgain: boolean;
  granted: boolean;
  status: Location.PermissionStatus;
};

export async function requestLocationPermissionState(): Promise<LocationPermissionResult> {
  const existingPermission = await Location.getForegroundPermissionsAsync();

  if (existingPermission.granted) {
    return {
      canAskAgain: existingPermission.canAskAgain,
      granted: true,
      status: existingPermission.status
    };
  }

  if (!existingPermission.canAskAgain) {
    return {
      canAskAgain: false,
      granted: false,
      status: existingPermission.status
    };
  }

  const permission = await Location.requestForegroundPermissionsAsync();

  return {
    canAskAgain: permission.canAskAgain,
    granted: permission.status === Location.PermissionStatus.GRANTED,
    status: permission.status
  };
}

export async function requestLocationPermission() {
  const permission = await requestLocationPermissionState();
  return permission.granted;
}
