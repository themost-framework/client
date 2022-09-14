import {AsyncSeriesEventEmitter} from '../events';

describe('AsyncSeriesEventEmitter', () => {

    it('should use AsyncSeriesEventEmitter.subscribe()', async ()=> {
        const emitter = new AsyncSeriesEventEmitter<{value: number}>();
        emitter.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });
        emitter.subscribe(async (event: { value: number }) => {
            event.value += 1;
        });
        const eventArgs = {
            value: 100
        }
        await emitter.emit(eventArgs);
        expect(eventArgs.value).toBe(102);
    });

});
