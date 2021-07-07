import { EthereumProvider } from '@openzeppelin/upgrades-core';
import { ContractInstance, Options } from './utils';
declare function changeProxyAdmin(proxyAddress: string, newAdmin: string, opts?: Options): Promise<void>;
declare function transferProxyAdminOwnership(newOwner: string, opts?: Options): Promise<void>;
declare function getInstance(opts?: Options): Promise<ContractInstance>;
export declare function getManifestAdmin(provider: EthereumProvider): Promise<ContractInstance>;
export declare const admin: {
    getInstance: typeof getInstance;
    transferProxyAdminOwnership: typeof transferProxyAdminOwnership;
    changeProxyAdmin: typeof changeProxyAdmin;
};
export {};
//# sourceMappingURL=admin.d.ts.map