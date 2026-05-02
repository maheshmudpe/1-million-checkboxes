import { getServerUrl } from "../../common/config.js";

export function createCheckboxSocket(token) {
  return window.io(getServerUrl(), {
    auth: token ? { token } : {},
  });
}
