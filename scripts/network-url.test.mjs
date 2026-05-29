import test from "node:test";
import assert from "node:assert/strict";

import { getNetworkUrls } from "./network-url.mjs";

test("getNetworkUrls returns IPv4 addresses for active external interfaces", () => {
  const urls = getNetworkUrls(5173, {
    WLAN: [
      {
        address: "192.168.1.175",
        family: "IPv4",
        internal: false
      },
      {
        address: "fe80::1",
        family: "IPv6",
        internal: false
      }
    ],
    Loopback: [
      {
        address: "127.0.0.1",
        family: "IPv4",
        internal: true
      }
    ]
  });

  assert.deepEqual(urls, ["http://192.168.1.175:5173/"]);
});
