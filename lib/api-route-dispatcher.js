import { routeHandlers } from "./api-route-map.js";

function normalizeApiPath(req) {
  const url = new URL(req.url || "/", "http://localhost");
  return url.pathname.replace(/^\/api/, "") || "/";
}

export async function dispatchApiRoute(req, res) {
  const route = normalizeApiPath(req).replace(/\/$/, "") || "/";
  const handler = routeHandlers[route];

  if (!handler) {
    return res.status(404).json({ error: "Not found" });
  }

  return handler(req, res);
}

export default dispatchApiRoute;
