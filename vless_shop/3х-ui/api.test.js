import { xUiAxios } from "./api.js";

const server = {
  ssl: true,
  address: "fireshield.network",
  port: 7649,
  webbasepath: "ieKaNamtH2I1i3qWOL",
};
const serverData = { username: "9eHDo2KLoX", password: "D8BKqg4FBK" };

describe("API test", () => {
  test("API-login", async () => {
    const res = (await xUiAxios(server, serverData, "login")).data;
    expect(res.success).toBe(true);
    expect(res.msg).toBe(" You have successfully logged into your account.");
    expect(res.obj).toBe(null);
  });

  test("API-NewX25519Cert", async () => {
    const res = (await xUiAxios(server, serverData, "NewX25519Cert")).data;
    expect(res.success).toBe(true);
    expect(res.msg).toBe("");
    expect([res.obj].length).toBeGreaterThan(0);
  });

  test("API-UnknownCommand", async () => {
    const res = await xUiAxios(server, serverData, "UnknownCommand");
    expect(res.success).toBe(false);
  });
});
