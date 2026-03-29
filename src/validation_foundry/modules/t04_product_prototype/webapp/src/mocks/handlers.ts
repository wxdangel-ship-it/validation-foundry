import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/offline/start", async () =>
    HttpResponse.json({
      status: "downloading",
      acceptedAt: new Date().toISOString(),
    }),
  ),
  http.post("/api/offline/delete", async () =>
    HttpResponse.json({
      status: "not_downloaded",
      removedAt: new Date().toISOString(),
    }),
  ),
  http.post("/api/import/parse", async () =>
    HttpResponse.json({
      status: "success",
      modeLabel: "导入轨迹 / 自定义参考路线",
    }),
  ),
  http.post("/api/explore/save", async () =>
    HttpResponse.json({
      status: "saved",
    }),
  ),
];
