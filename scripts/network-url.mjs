import { networkInterfaces } from "node:os";

export function getNetworkUrls(port, interfaces = networkInterfaces()) {
  return Object.values(interfaces)
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => `http://${address.address}:${port}/`);
}
