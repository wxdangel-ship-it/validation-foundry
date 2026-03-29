async function safePost(path: string, fallback: Record<string, unknown>) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return fallback;
  }
}

export function requestDownloadStart() {
  return safePost("/api/offline/start", { status: "downloading" });
}

export function requestDownloadDelete() {
  return safePost("/api/offline/delete", { status: "not_downloaded" });
}

export function requestImportParse() {
  return safePost("/api/import/parse", {
    status: "success",
    modeLabel: "导入轨迹 / 自定义参考路线",
  });
}

export function requestExploreSave() {
  return safePost("/api/explore/save", { status: "saved" });
}
