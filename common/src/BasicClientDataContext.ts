import { ClientDataContext } from '@themost/client';
import { ClientDataContextOptions } from '@themost/client';
import { BasicClientDataService } from './BasicClientDataService';

class BasicClientDataContext extends ClientDataContext {
    constructor(base: string, options?: ClientDataContextOptions) {
        super(new BasicClientDataService(base, options), options);
    }
}

export { BasicClientDataContext };