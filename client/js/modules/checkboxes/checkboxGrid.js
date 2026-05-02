import {
  getState,
  getVisibleSummary,
  isVisible,
  revertCheckbox,
  setChunk,
  updateCheckbox,
} from "./checkbox.store.js";

export function createCheckboxGrid({ grid, countEl, pageEl, onToggle }) {
  function updateMeta() {
    const state = getState();
    const summary = getVisibleSummary();
    const from = state.total === 0 ? 0 : state.offset + 1;
    const to = state.offset + state.values.length;

    countEl.innerText =
      `Total checked: ${summary.checkedCount} / ${summary.total} | ` +
      `Visible checked: ${summary.visibleChecked} / ${summary.visibleTotal}`;
    pageEl.innerText = `Showing ${from}-${to}`;
  }

  function render(chunk) {
    setChunk(chunk);
    grid.innerHTML = "";

    chunk.values.forEach((checked, localIndex) => {
      const globalIndex = chunk.offset + localIndex;
      const label = document.createElement("label");
      const box = document.createElement("input");

      label.className = "checkbox-cell";
      label.title = `Checkbox #${globalIndex}`;

      box.type = "checkbox";
      box.checked = checked;

      box.addEventListener("change", () => {
        onToggle(globalIndex);
      });

      label.appendChild(box);
      grid.appendChild(label);
    });

    updateMeta();
  }

  function applyUpdate(index, value, checkedCount) {
    updateCheckbox(index, value, checkedCount);

    if (isVisible(index)) {
      const box = grid.children[index - getState().offset]?.querySelector("input");
      if (box) box.checked = value;
    }

    updateMeta();
  }

  function revertUpdate(index) {
    const value = revertCheckbox(index);

    if (value === null) return;

    const box = grid.children[index - getState().offset]?.querySelector("input");
    if (box) box.checked = value;

    updateMeta();
  }

  return {
    render,
    applyUpdate,
    revertUpdate,
  };
}
