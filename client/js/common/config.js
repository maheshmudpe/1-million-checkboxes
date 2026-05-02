const params = new URLSearchParams(window.location.search);
const port = params.get("port");

export const config = {
  serverPort: port,
};

export function getServerUrl() {
  if (config.serverPort) {
    return `http://localhost:${config.serverPort}`;
  }

  return window.location.origin;
}
