import {
  getAccessToken,
  getStoredUser,
  login,
  logout,
} from "./js/modules/auth/auth.api.js";
import { getCheckboxChunk } from "./js/modules/checkboxes/checkbox.api.js";
import { createCheckboxSocket } from "./js/modules/checkboxes/checkbox.socket.js";
import { createCheckboxGrid } from "./js/modules/checkboxes/checkboxGrid.js";
import { getState } from "./js/modules/checkboxes/checkbox.store.js";
import { createStatus } from "./js/modules/checkboxes/status.js";

const CHUNK_SIZE = 500;

const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const pageEl = document.getElementById("page");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const userEl = document.getElementById("user");
const presenceEl = document.getElementById("presence");

let token = getAccessToken();
let user = getStoredUser();
let socket = null;
let currentOffset = 0;

const status = createStatus(statusEl);
const checkboxGrid = createCheckboxGrid({
  grid: gridEl,
  countEl,
  pageEl,
  onToggle(index) {
    if (!token) {
      checkboxGrid.revertUpdate(index);
      status.warning("Login required to change checkboxes");
      return;
    }

    socket.emit("toggle", { index });
  },
});

loginBtn.addEventListener("click", async () => {
  try {
    const username = usernameInput.value.trim();
    if (!username) {
      status.warning("Enter a username to login");
      return;
    }

    const tokenSet = await login(username);
    token = tokenSet.access_token;
    user = tokenSet.user;
    connectSocket();
    updateAuthUi();
    status.text("Logged in");
  } catch (err) {
    status.warning(err.message);
  }
});

logoutBtn.addEventListener("click", () => {
  logout();
  token = null;
  user = null;
  connectSocket();
  updateAuthUi();
});

prevBtn.addEventListener("click", () => {
  loadChunk(Math.max(currentOffset - CHUNK_SIZE, 0));
});

nextBtn.addEventListener("click", () => {
  const state = getState();
  loadChunk(Math.min(currentOffset + CHUNK_SIZE, state.total - CHUNK_SIZE));
});

connectSocket();
updateAuthUi();
await loadChunk(currentOffset);

function connectSocket() {
  if (socket) {
    socket.disconnect();
  }

  socket = createCheckboxSocket(token);

  socket.on("init", (data) => {
    status.connected(data.authenticated, data.user || user);
    presenceEl.innerText = `Connected users: ${data.connectedUsers}`;
  });

  socket.on("presence", ({ connectedUsers }) => {
    presenceEl.innerText = `Connected users: ${connectedUsers}`;
  });

  socket.on("update", ({ index, value, checkedCount }) => {
    checkboxGrid.applyUpdate(index, value, checkedCount);
  });

  socket.on("toggle-rejected", ({ index, message }) => {
    checkboxGrid.revertUpdate(index);
    status.warning(message);
  });

  socket.on("rate-limit", ({ index, message }) => {
    checkboxGrid.revertUpdate(index);
    status.warning(message);
  });

  socket.on("error-message", ({ index, message }) => {
    checkboxGrid.revertUpdate(index);
    status.warning(message);
  });

  socket.on("disconnect", () => {
    status.disconnected();
  });
}

async function loadChunk(offset) {
  currentOffset = Math.max(offset, 0);
  const chunk = await getCheckboxChunk({
    offset: currentOffset,
    limit: CHUNK_SIZE,
  });

  checkboxGrid.render(chunk);
  updatePagingButtons();
}

function updatePagingButtons() {
  const state = getState();
  prevBtn.disabled = state.offset <= 0;
  nextBtn.disabled = state.offset + state.limit >= state.total;
}

function updateAuthUi() {
  userEl.innerText = user ? `Logged in: ${user.username}` : "Anonymous read-only";
  logoutBtn.disabled = !token;
}
