import axios from "axios";
import https from "https";

// Создаем axios instance с настройками SSL
function createAxiosInstance(server) {
  const baseURL = `http${server.ssl ? "s" : ""}://${server.address}:${server.port}/${server.webbasepath}`;
  
  // Для IP-адресов отключаем проверку SSL, для доменов - оставляем
  const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(server.address);
  
  const config = {
    baseURL,
    timeout: 10000
  };

  if (isIPAddress && server.ssl) {
    config.httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
  }

  return axios.create(config);
}

export async function xUiAxios(server, data, command) {
  try {
    const api = createAxiosInstance(server);
    
    switch (command) {
      case "login":
        const loginResponse = await api.post("/login/", {
          username: data.username,
          password: data.password,
        });
        return {
          success: true,
          data: loginResponse.data,
          status: loginResponse.status
        };

      case "NewX25519Cert":
        const certResponse = await api.get("/panel/api/server/getNewX25519Cert");
        return {
          success: true,
          data: certResponse.data,
          status: certResponse.status
        };

      default:
        return {
          success: false,
          error: `Unknown command: ${command}`
        };
    }
  } catch (error) {
    console.error(`xUiAxios error (${command}):`, error.message);
    
    return {
      success: false,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    };
  }
}