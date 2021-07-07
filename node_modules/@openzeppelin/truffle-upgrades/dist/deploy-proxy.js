"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployProxy = void 0;
const upgrades_core_1 = require("@openzeppelin/upgrades-core");
const utils_1 = require("./utils");
async function deployProxy(Contract, args = [], opts = {}) {
    if (!Array.isArray(args)) {
        opts = args;
        args = [];
    }
    const requiredOpts = utils_1.withDefaults(opts);
    const { kind } = requiredOpts;
    const provider = utils_1.wrapProvider(requiredOpts.deployer.provider);
    const manifest = await upgrades_core_1.Manifest.forNetwork(provider);
    if (kind === 'uups') {
        if (await manifest.getAdmin()) {
            upgrades_core_1.logWarning(`A proxy admin was previously deployed on this network`, [
                `This is not natively used with the current kind of proxy ('uups').`,
                `Changes to the admin will have no effect on this new proxy.`,
            ]);
        }
    }
    const impl = await utils_1.deployImpl(Contract, requiredOpts);
    const data = getInitializerData(Contract, args, opts.initializer);
    let proxyDeployment;
    switch (kind) {
        case 'uups': {
            const ProxyFactory = utils_1.getProxyFactory(Contract);
            proxyDeployment = Object.assign({ kind }, await utils_1.deploy(requiredOpts.deployer, ProxyFactory, impl, data));
            break;
        }
        case 'transparent': {
            const AdminFactory = utils_1.getProxyAdminFactory(Contract);
            const adminAddress = await upgrades_core_1.fetchOrDeployAdmin(provider, () => utils_1.deploy(requiredOpts.deployer, AdminFactory));
            const TransparentUpgradeableProxyFactory = utils_1.getTransparentUpgradeableProxyFactory(Contract);
            proxyDeployment = Object.assign({ kind }, await utils_1.deploy(requiredOpts.deployer, TransparentUpgradeableProxyFactory, impl, adminAddress, data));
            break;
        }
    }
    await manifest.addProxy(proxyDeployment);
    Contract.address = proxyDeployment.address;
    const contract = new Contract(proxyDeployment.address);
    contract.transactionHash = proxyDeployment.txHash;
    return contract;
}
exports.deployProxy = deployProxy;
function getInitializerData(Contract, args, initializer) {
    if (initializer === false) {
        return '0x';
    }
    const allowNoInitialization = initializer === undefined && args.length === 0;
    initializer = initializer !== null && initializer !== void 0 ? initializer : 'initialize';
    const stub = new Contract('');
    if (initializer in stub.contract.methods) {
        return stub.contract.methods[initializer](...args).encodeABI();
    }
    else if (allowNoInitialization) {
        return '0x';
    }
    else {
        throw new Error(`Contract ${Contract.name} does not have a function \`${initializer}\``);
    }
}
//# sourceMappingURL=deploy-proxy.js.map