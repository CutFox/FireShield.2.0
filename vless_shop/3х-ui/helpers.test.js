import { isIpAddress, buildBaseUrl } from "./helpers.js";

describe("helpers", () => {
  test("isIpAddress detects IPv4 addresses", () => {
    expect(isIpAddress("127.0.0.1")).toBe(true);
    expect(isIpAddress("192.168.0.100")).toBe(true);
    expect(isIpAddress("not.an.ip")).toBe(false);
    expect(isIpAddress("")).toBe(false);
    expect(isIpAddress("::1")).toBe(false);
  });

  test("buildBaseUrl constructs correct URL", () => {
    const server1 = {
      address: "example.com",
      port: 8080,
      ssl: false,
      webbasepath: "api",
    };
    expect(buildBaseUrl(server1)).toBe("http://example.com:8080/api");

    const server2 = {
      address: "1.2.3.4",
      port: 443,
      ssl: true,
      webbasepath: "",
    };
    expect(buildBaseUrl(server2)).toBe("https://1.2.3.4:443/");
  });
});
