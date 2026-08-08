/* eslint-disable */
import routeHandler0 from "./agents/ai/engineer.js";
import routeHandler1 from "./agents/architect/design.js";
import routeHandler2 from "./agents/backend/engineer.js";
import routeHandler3 from "./agents/backend/enhancer.js";
import routeHandler4 from "./agents/coding/generator.js";
import routeHandler5 from "./agents/database/engineer.js";
import routeHandler6 from "./agents/debug/debug-worker.js";
import routeHandler7 from "./agents/debug/worker.js";
import routeHandler8 from "./agents/delivery/worker.js";
import routeHandler9 from "./agents/developer/build.js";
import routeHandler10 from "./agents/engineering/manager.js";
import routeHandler11 from "./agents/estimation/calculate.js";
import routeHandler12 from "./agents/frontend/engineer.js";
import routeHandler13 from "./agents/frontend/enhancer.js";
import routeHandler14 from "./agents/github/intelligence.js";
import routeHandler15 from "./agents/payment/gate.js";
import routeHandler16 from "./agents/product/intelligence.js";
import routeHandler17 from "./agents/proposal/generate.js";
import routeHandler18 from "./agents/repair/worker.js";
import routeHandler19 from "./agents/requirements/index.js";
import routeHandler20 from "./agents/technology/intelligence.js";
import routeHandler21 from "./agents/technology/technology-intelligence.js";
import routeHandler22 from "./agents/testing/executor.js";
import routeHandler23 from "./execution/environment.js";
import routeHandler24 from "./files/manager.js";
import routeHandler25 from "./orchestrator/execution-debug-bridge.js";
import routeHandler26 from "./projects/create.js";
import routeHandler27 from "./repository/manager.js";

export const routeHandlers = {
  "/agents/ai/engineer": routeHandler0,
  "/agents/architect/design": routeHandler1,
  "/agents/backend/engineer": routeHandler2,
  "/agents/backend/enhancer": routeHandler3,
  "/agents/coding/generator": routeHandler4,
  "/agents/database/engineer": routeHandler5,
  "/agents/debug/debug-worker": routeHandler6,
  "/agents/debug/worker": routeHandler7,
  "/agents/delivery/worker": routeHandler8,
  "/agents/developer/build": routeHandler9,
  "/agents/engineering/manager": routeHandler10,
  "/agents/estimation/calculate": routeHandler11,
  "/agents/frontend/engineer": routeHandler12,
  "/agents/frontend/enhancer": routeHandler13,
  "/agents/github/intelligence": routeHandler14,
  "/agents/payment/gate": routeHandler15,
  "/agents/product/intelligence": routeHandler16,
  "/agents/proposal/generate": routeHandler17,
  "/agents/repair/worker": routeHandler18,
  "/agents/requirements": routeHandler19,
  "/agents/technology/intelligence": routeHandler20,
  "/agents/technology/technology-intelligence": routeHandler21,
  "/agents/testing/executor": routeHandler22,
  "/execution/environment": routeHandler23,
  "/files/manager": routeHandler24,
  "/orchestrator/execution-debug-bridge": routeHandler25,
  "/projects/create": routeHandler26,
  "/repository/manager": routeHandler27
};
