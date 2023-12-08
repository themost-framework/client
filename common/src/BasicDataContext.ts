import { ClientDataContext } from '@themost/client';
import { ClientDataContextOptions } from '@themost/client';
import { BasicDataService } from './BasicDataService';

class BasicDataContext extends ClientDataContext {
    constructor(base: string, options?: ClientDataContextOptions) {
        super(new BasicDataService(base, options), options);
    }
}

export { BasicDataContext };