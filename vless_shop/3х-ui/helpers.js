/**
 * Вспомогательные функции для работы с серверным конфигом
 * Расположены отдельно, чтобы переиспользовать в других модулях.
 */

/** Проверка, что строка — IPv4 адрес */
export function isIpAddress(address) {
  return /^\d+\.\d+\.\d+\.\d+$/.test(address);
}

/** Сборка базового URL из конфигурации сервера */
export function buildBaseUrl(server) {
  const protocol = server.ssl ? "https" : "http";
  return `${protocol}://${server.address}:${server.port}/${server.webbasepath}`;
}
