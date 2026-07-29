import {
  selectModel,
  getAvailableModels
} from "./api/core/model-router.js";


console.log("\n=== ANNEXE AI Model Router Test ===\n");


console.log(
  selectModel({
    task:"coding",
    complexity:"high"
  })
);


console.log(
  selectModel({
    task:"architecture",
    complexity:"high"
  })
);


console.log(
  getAvailableModels()
);


console.log("\nMODEL ROUTER TEST COMPLETE\n");