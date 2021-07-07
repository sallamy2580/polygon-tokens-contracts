import { Deployer } from './truffle';
import { ValidationOptions } from '@openzeppelin/upgrades-core';
export interface Options extends ValidationOptions {
    deployer?: Deployer;
}
export declare function withDefaults(opts: Options): Required<Options>;
//# sourceMappingURL=options.d.ts.map