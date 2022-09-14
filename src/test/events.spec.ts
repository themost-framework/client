import {AsyncSeriesEventEmitter} from '../events';

describe('AsyncSeriesEventEmitter', () => {

    it('should create instance', ()=> {
        const emitter = new AsyncSeriesEventEmitter();
        expect(emitter).toBeTruthy();
    });

    it('should use AsyncSeriesEventEmitter.subscribe()', async ()=> {
        const emitter = new AsyncSeriesEventEmitter();
        emitter.subscribe('before.action', (event: { value: number }) => {
            event.value += 1;
            return Promise.resolve();
        });
        emitter.subscribe('before.action', (event: { value: number }) => {
            event.value += 1;
            return Promise.resolve();
        });
        const eventArgs = {
            value: 100
        }
        await emitter.next('before.action', eventArgs);
        expect(eventArgs.value).toBe(102);
    });

    it('should use AsyncSeriesEventEmitter.unsubscribe()', async ()=> {
        const emitter = new AsyncSeriesEventEmitter();
        const listener = (event: { value: number }) => {
            event.value += 1;
            return Promise.resolve();
        }
        emitter.subscribe('before.action', listener);
        expect(emitter.listenerCount('before.action')).toBe(1);
        emitter.unsubscribe('before.action', listener)
        expect(emitter.listenerCount('before.action')).toBe(0);

    });

    it('should use AsyncSeriesEventEmitter.on()', async ()=> {
        const emitter = new AsyncSeriesEventEmitter();
        // tslint:disable-next-line:only-arrow-functions
        emitter.on('before.action', function(ev, callback) {
            ev.value += 2;
            return callback();
        });
        // tslint:disable-next-line:only-arrow-functions
        emitter.once('before.action', function(ev, callback) {
            ev.value += 2;
            return callback();
        });
        const eventArgs = {
            value: 0
        }
        await new Promise<void>((resolve, reject) => {
            // tslint:disable-next-line:only-arrow-functions
            emitter.emit('before.action', eventArgs, function(err: Error) {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
        let listenerCount = emitter.listenerCount('before.action');
        expect(listenerCount).toBe(1);
        expect(eventArgs.value).toBe(4);
        emitter.removeAllListeners('before.action');
        listenerCount = emitter.listenerCount('before.action');
        expect(listenerCount).toBe(0);
    });

    it('should use AsyncSeriesEventEmitter.subscribeOnce()', async ()=> {
        const emitter = new AsyncSeriesEventEmitter();
        emitter.subscribe('before.action', async (event: { value: number }) => {
            event.value += 2;
        });
        emitter.subscribeOnce('before.action', async (event: { value: number }) => {
            event.value += 2;
        });
        const eventArgs = {
            value: 0
        }
        await emitter.next('before.action', eventArgs);
        expect(eventArgs.value).toBe(4);
        const listenerCount = emitter.listeners('before.action').length;
        expect(listenerCount).toBe(1);
        await emitter.next('before.action', eventArgs);
        expect(eventArgs.value).toBe(6);

    });

});
