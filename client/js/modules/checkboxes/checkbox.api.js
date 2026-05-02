import { getServerUrl } from "../../common/config.js";

export async function getCheckboxChunk({ offset, limit }) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });

  const res = await fetch(`${getServerUrl()}/checkboxes?${params}`);

  if (!res.ok) {
    throw new Error("Unable to load checkboxes");
  }

  return res.json();
}
