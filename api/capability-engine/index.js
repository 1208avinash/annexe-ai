import CapabilityRegistry from "./capability-registry.js";
import CapabilityResolver from "./capability-resolver.js";
import CapabilityValidator from "./capability-validator.js";
import ApplicationAssembler from "./application-assembler.js";
import applicationCompositions, {
    getApplicationComposition,
    listApplicationTypes
} from "./application-compositions.js";
import coreCapabilities from "./catalog/core-capabilities.js";

export {
    CapabilityRegistry,
    CapabilityResolver,
    CapabilityValidator,
    ApplicationAssembler,
    applicationCompositions,
    getApplicationComposition,
    listApplicationTypes,
    coreCapabilities
};

export default {
    CapabilityRegistry,
    CapabilityResolver,
    CapabilityValidator,
    ApplicationAssembler,
    applicationCompositions,
    getApplicationComposition,
    listApplicationTypes,
    coreCapabilities
};
