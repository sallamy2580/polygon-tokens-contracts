"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProxyAdminFactory = exports.getTransparentUpgradeableProxyFactory = exports.getProxyFactory = void 0;
const truffle_1 = require("./truffle");
const ERC1967Proxy_json_1 = __importDefault(require("@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol/ERC1967Proxy.json"));
const TransparentUpgradeableProxy_json_1 = __importDefault(require("@openzeppelin/upgrades-core/artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json"));
const ProxyAdmin_json_1 = __importDefault(require("@openzeppelin/upgrades-core/artifacts//@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json"));
function makeFactoryGetter(artifacts) {
    return function (template) {
        var _a, _b;
        const contract = truffle_1.TruffleContract(artifacts);
        contract.setProvider((_a = template === null || template === void 0 ? void 0 : template.currentProvider) !== null && _a !== void 0 ? _a : truffle_1.getTruffleProvider());
        contract.defaults((_b = template === null || template === void 0 ? void 0 : template.class_defaults) !== null && _b !== void 0 ? _b : truffle_1.getTruffleDefaults());
        return contract;
    };
}
exports.getProxyFactory = makeFactoryGetter(ERC1967Proxy_json_1.default);
exports.getTransparentUpgradeableProxyFactory = makeFactoryGetter(TransparentUpgradeableProxy_json_1.default);
exports.getProxyAdminFactory = makeFactoryGetter(ProxyAdmin_json_1.default);
//# sourceMappingURL=factories.js.map