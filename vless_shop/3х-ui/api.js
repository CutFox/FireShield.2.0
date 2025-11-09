import axios from "axios";
import https from "https";
import { isIpAddress, buildBaseUrl } from "./helpers.js";

// Создаем axios instance с настройками SSL
function createAxiosInstance(server) {
  const baseURL = buildBaseUrl(server);

  const config = {
    baseURL,
    timeout: 10000,
  };

  // Если используется SSL на IP-адресе — отключаем проверку сертификата
  if (server.ssl && isIpAddress(server.address)) {
    config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }

  return axios.create(config);
}

export async function xUiAxios(server, data, command) {
  try {
    const api = createAxiosInstance(server);

    // Команда: login
    if (command === "login") {
      const loginResponse = await api.post("/login/", {
        username: data.username,
        password: data.password,
      });

      const setCookieHeader = loginResponse.headers?.["set-cookie"];
      const authCookie =
        Array.isArray(setCookieHeader) && setCookieHeader.length
          ? setCookieHeader[0].split(";")[0]
          : null;

      if (authCookie) {
        // Устанавливаем cookie в инстанс api, чтобы последующие запросы через этот api использовали её
        axios.defaults.headers.common["Cookie"] = authCookie;
      }

      return {
        success: true,
        data: loginResponse.data,
        setCookie: setCookieHeader,
        authCookie,
        status: loginResponse.status,
      };
    }

    // Команда: NewX25519Cert
    if (command === "NewX25519Cert") {
      const certResponse = await api.get("/panel/api/server/getNewX25519Cert/");
      return {
        success: true,
        data: certResponse.data,
        status: certResponse.status,
      };
    }

    // Неизвестная команда
    return {
      success: false,
      error: `Unknown command: ${command}`,
    };
  } catch (error) {
    console.error(`xUiAxios error (${command}):`, error?.message || error);

    return {
      success: false,
      error: error?.message || String(error),
      response: error?.response?.data,
      status: error?.response?.status,
    };
  }
}
