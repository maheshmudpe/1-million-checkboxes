let state = {
  offset: 0,
  limit: 500,
  total: 0,
  checkedCount: 0,
  values: [],
};

export function setChunk(chunk) {
  state = {
    offset: chunk.offset,
    limit: chunk.limit,
    total: chunk.total,
    checkedCount: chunk.checkedCount,
    values: chunk.values,
  };
}

export function updateCheckbox(globalIndex, value, checkedCount) {
  const localIndex = globalIndex - state.offset;

  if (localIndex >= 0 && localIndex < state.values.length) {
    state.values[localIndex] = value;
  }

  if (Number.isInteger(checkedCount)) {
    state.checkedCount = checkedCount;
  }
}

export function revertCheckbox(globalIndex) {
  const localIndex = globalIndex - state.offset;

  if (localIndex < 0 || localIndex >= state.values.length) {
    return null;
  }

  return state.values[localIndex];
}

export function isVisible(globalIndex) {
  return globalIndex >= state.offset && globalIndex < state.offset + state.values.length;
}

export function getState() {
  return state;
}

export function getVisibleSummary() {
  return {
    visibleChecked: state.values.filter(Boolean).length,
    visibleTotal: state.values.length,
    checkedCount: state.checkedCount,
    total: state.total,
  };
}
