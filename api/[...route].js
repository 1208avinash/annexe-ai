import dispatchApiRoute from "../lib/api-route-dispatcher.js";

export default async function handler(req, res) {
  return dispatchApiRoute(req, res);
}
