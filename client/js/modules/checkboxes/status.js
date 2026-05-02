export function createStatus(statusEl) {
  return {
    text(message) {
      statusEl.innerText = message;
    },
    connected(authenticated, user) {
      statusEl.innerText = authenticated
        ? `Connected as ${user.username}`
        : "Connected as anonymous read-only user";
    },
    disconnected() {
      statusEl.innerText = "Disconnected";
    },
    warning(message) {
      statusEl.innerText = message;
    },
  };
}
