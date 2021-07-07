"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.getManifestAdmin = void 0;
const chalk_1 = __importDefault(require("chalk"));
const upgrades_core_1 = require("@openzeppelin/upgrades-core");
const utils_1 = require("./utils");
const SUCCESS_CHECK = chalk_1.default.green('✔') + ' ';
const FAILURE_CROSS = chalk_1.default.red('✘') + ' ';
async function changeProxyAdmin(proxyAddress, newAdmin, opts = {}) {
    const { deployer } = utils_1.withDefaults(opts);
    const provider = utils_1.wrapProvider(deployer.provider);
    const admin = await getManifestAdmin(provider);
    const proxyAdminAddress = await upgrades_core_1.getAdminAddress(provider, proxyAddress);
    if (admin.address !== proxyAdminAddress) {
        throw new Error('Proxy admin is not the one registered in the network manifest');
    }
    else if (admin.address !== newAdmin) {
        await admin.changeProxyAdmin(proxyAddress, newAdmin);
    }
}
async function transferProxyAdminOwnership(newOwner, opts = {}) {
    const { deployer } = utils_1.withDefaults(opts);
    const provider = utils_1.wrapProvider(deployer.provider);
    const admin = await getManifestAdmin(provider);
    await admin.transferOwnership(newOwner);
    const manifest = await upgrades_core_1.Manifest.forNetwork(provider);
    const { proxies } = await manifest.read();
    for (const { address, kind } of proxies) {
        if (admin.address == (await upgrades_core_1.getAdminAddress(provider, address))) {
            console.log(SUCCESS_CHECK + `${address} (${kind}) proxy ownership transfered through admin proxy`);
        }
        else {
            console.log(FAILURE_CROSS + `${address} (${kind}) proxy ownership not affected by admin proxy`);
        }
    }
}
async function getInstance(opts = {}) {
    const { deployer } = utils_1.withDefaults(opts);
    const provider = utils_1.wrapProvider(deployer.provider);
    return await getManifestAdmin(provider);
}
async function getManifestAdmin(provider) {
    const manifest = await upgrades_core_1.Manifest.forNetwork(provider);
    const manifestAdmin = await manifest.getAdmin();
    const AdminFactory = utils_1.getProxyAdminFactory();
    const proxyAdminAddress = manifestAdmin === null || manifestAdmin === void 0 ? void 0 : manifestAdmin.address;
    if (proxyAdminAddress === undefined) {
        throw new Error('No ProxyAdmin was found in the network manifest');
    }
    return new AdminFactory(proxyAdminAddress);
}
exports.getManifestAdmin = getManifestAdmin;
exports.admin = {
    getInstance,
    transferProxyAdminOwnership,
    changeProxyAdmin,
};
//# sourceMappingURL=admin.js.map