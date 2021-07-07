"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareUpgrade = void 0;
const upgrades_core_1 = require("@openzeppelin/upgrades-core");
const utils_1 = require("./utils");
async function prepareUpgrade(proxy, Contract, opts = {}) {
    const requiredOpts = utils_1.withDefaults(opts);
    const provider = utils_1.wrapProvider(requiredOpts.deployer.provider);
    const proxyAddress = utils_1.getContractAddress(proxy);
    requiredOpts.kind = await upgrades_core_1.setProxyKind(provider, proxyAddress, opts);
    return await utils_1.deployImpl(Contract, requiredOpts, proxyAddress);
}
exports.prepareUpgrade = prepareUpgrade;
//# sourceMappingURL=prepare-upgrade.js.map