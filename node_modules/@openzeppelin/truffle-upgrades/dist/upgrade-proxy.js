"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeProxy = void 0;
const upgrades_core_1 = require("@openzeppelin/upgrades-core");
const utils_1 = require("./utils");
async function upgradeProxy(proxy, Contract, opts = {}) {
    const requiredOpts = utils_1.withDefaults(opts);
    const provider = utils_1.wrapProvider(requiredOpts.deployer.provider);
    const proxyAddress = utils_1.getContractAddress(proxy);
    requiredOpts.kind = await upgrades_core_1.setProxyKind(provider, proxyAddress, opts);
    const upgradeTo = await getUpgrader(provider, Contract, proxyAddress);
    const nextImpl = await utils_1.deployImpl(Contract, requiredOpts, proxyAddress);
    await upgradeTo(nextImpl);
    Contract.address = proxyAddress;
    return new Contract(proxyAddress);
}
exports.upgradeProxy = upgradeProxy;
async function getUpgrader(provider, contractTemplate, proxyAddress) {
    const adminAddress = await upgrades_core_1.getAdminAddress(provider, proxyAddress);
    const adminBytecode = await upgrades_core_1.getCode(provider, adminAddress);
    if (adminBytecode === '0x') {
        // No admin contract: use TransparentUpgradeableProxyFactory to get proxiable interface
        const TransparentUpgradeableProxyFactory = utils_1.getTransparentUpgradeableProxyFactory(contractTemplate);
        const proxy = new TransparentUpgradeableProxyFactory(proxyAddress);
        return nextImpl => proxy.upgradeTo(nextImpl);
    }
    else {
        // Admin contract: redirect upgrade call through it
        const manifest = await upgrades_core_1.Manifest.forNetwork(provider);
        const AdminFactory = utils_1.getProxyAdminFactory(contractTemplate);
        const admin = new AdminFactory(adminAddress);
        const manifestAdmin = await manifest.getAdmin();
        if (admin.address !== (manifestAdmin === null || manifestAdmin === void 0 ? void 0 : manifestAdmin.address)) {
            throw new Error('Proxy admin is not the one registered in the network manifest');
        }
        return nextImpl => admin.upgrade(proxyAddress, nextImpl);
    }
}
//# sourceMappingURL=upgrade-proxy.js.map