import { EthereumProvider, ValidationRunData } from '@openzeppelin/upgrades-core';
import { ContractClass } from './truffle';
export declare function validateArtifacts(artifactsPath: string, sourcesPath: string): Promise<ValidationRunData>;
export declare function getLinkedBytecode(Contract: ContractClass, provider: EthereumProvider): Promise<string>;
//# sourceMappingURL=validations.d.ts.map