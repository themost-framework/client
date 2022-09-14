import * as EventEmitter from 'events';
import { applyEachSeries } from 'async';

declare interface FiredListener {
    fired: boolean;
}

/**
 * Wraps an async listener and returns a callback-like function
 * @param {function(...*):Promise<void>} asyncListener
 */
function wrapAsyncListener(asyncListener: (...arg: any) => Promise<void>) {
    /**
     * @this SequentialEventEmitter
     */
    const result = function() {
        // get arguments without callback
        const args = [].concat(Array.prototype.slice.call(arguments, 0, arguments.length -1));
        // get callback
        const callback = arguments[arguments.length - 1];
        return asyncListener.apply(this, args).then(() => {
            return callback();
        }).catch((err: Error) => {
            return callback(err);
        });
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(result, '_listener', {
        configurable: true,
        enumerable: true,
        value: asyncListener
    });
    return result;
}

function wrapOnceListener(listener: (...arg: any[]) => void) {
    /**
     * @this SequentialEventEmitter
     */
    const result = function() {
        // get arguments without callback
        const args = Array.from(arguments);
        // get callback
        const callback = args.pop();
        args.push((err?: Error) => {
            Object.assign(listener, {
                fired: true
            });
            return callback(err);
        });
        return listener.apply(this, args);
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(result, '_listener', {
        configurable: true,
        enumerable: true,
        value: listener
    });
    return result;
}

/**
 * Wraps an async listener and returns a callback-like function
 * @param {string} event
 * @param {function(...*):Promise<void>} asyncListener
 */
function wrapOnceAsyncListener(event: string | symbol, asyncListener: (...arg: any) => Promise<void>) {
    /**
     * @this SequentialEventEmitter
     */
    const result = function() {
        // tslint:disable-next-line:no-arg
        const callee = arguments.callee;
        // get arguments without callback
        const args = [].concat(Array.prototype.slice.call(arguments, 0, arguments.length -1));
        // get callback
        const callback = arguments[arguments.length - 1];
        const self = this;
        return asyncListener.apply(self, args).then(() => {
            // manually remove async listener
            self.removeListener(event, callee);
            return callback();
        }).catch((err: Error) => {
            // manually remove async listener
            self.removeListener(event, callee);
            return callback(err);
        });
    }
    // set async listener property in order to have an option to unsubscribe
    Object.defineProperty(result, '_listener', {
        configurable: true,
        enumerable: true,
        value: asyncListener
    });
    return result;
}

// noinspection JSClosureCompilerSyntax,JSClosureCompilerSyntax,JSClosureCompilerSyntax,JSClosureCompilerSyntax
/**
 * SequentialEventEmitter class is an extension of node.js EventEmitter class where listeners are executing in series.
 */
class SequentialEventEmitter extends EventEmitter {
    constructor() {
        super();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * Executes event listeners in series.
     * @param {String} event - The event that is going to be executed.
     * @param {...*} args - An object that contains the event arguments.
     */
    // eslint-disable-next-line no-unused-vars
    emit(event: string | symbol, ...args: any[]): any {
        // ensure callback
        // get listeners
        if (typeof this.listeners !== 'function') {
            throw new Error('undefined listeners');
        }
        const listeners: any = this.listeners(event);

        const argsAndCallback = [].concat(Array.prototype.slice.call(arguments, 1));
        if (argsAndCallback.length > 0) {
            // check the last argument (expected callback function)
            if (typeof argsAndCallback[argsAndCallback.length - 1] !== 'function') {
                throw new TypeError('Expected event callback');
            }
        }
        // get callback function (the last argument of arguments list)
        const callback = argsAndCallback.pop();

        // validate listeners
        if (listeners.length === 0) {
            // exit emitter
            return callback();
        }
        argsAndCallback.push((err?: Error) => {
            for(const listener of listeners) {
                if (listener._listener && listener._listener.fired) {
                    this.removeListener(event, listener);
                }
            }
            return callback(err);
        });
        // apply each series
        return applyEachSeries.apply(this, [listeners].concat(argsAndCallback));
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} event
     * @param {function(...*):Promise<void>} asyncListener
     * @returns this
     */
    subscribe(event: string | symbol, asyncListener: (...args: any[]) => Promise<void>): this {
        return this.on(event, wrapAsyncListener(asyncListener));
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} event
     * @param {function(...*):Promise<void>} asyncListener
     * @returns this
     */
    unsubscribe(event: string | symbol, asyncListener: (...args: any[]) => Promise<void>): this {
        // get event listeners
        const listeners = this.listeners(event);
        // enumerate
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < listeners.length; i++) {
            const item: any | { _listener: any} = listeners[i];
            // if listener has an underlying listener
            if (typeof item._listener === 'function') {
                // and it's the same with the listener specified
                if (item._listener === asyncListener) {
                    // remove listener and break
                    this.removeListener(event, item);
                    break;
                }
            }
        }
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} event
     * @param {function(...*):Promise<void>} asyncListener
     */
    subscribeOnce(event: string | symbol, asyncListener: (...args: any[]) => Promise<void>): this {
        return this.once(event,  wrapAsyncListener(asyncListener));
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} event
     * @param {...args} args
     */
    // eslint-disable-next-line no-unused-vars
    next(event: string | symbol, ...args: any[]): Promise<void> {
        const self = this;
        /**
         * get arguments as array
         * @type {*[]}
         */
        const argsAndCallback: any[] = [event].concat(Array.prototype.slice.call(arguments, 1));
        // eslint-disable-next-line no-undef
        return new Promise((resolve, reject) => {
            // set callback
            argsAndCallback.push((err: Error) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
            // emit event
            self.emit.apply(self, argsAndCallback);
        });
    }
    once(event: string | symbol, listener: (...args: any[]) => void): this {
        return this.on(event, wrapOnceListener(listener));
    }
}

class AsyncSeriesEventEmitter<T> {

    private readonly emitter = new SequentialEventEmitter();

    emit(value?: T): Promise<void> {
        return new Promise((resolve, reject) => {
            return this.emitter.emit('async.event', value, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });
    }

    subscribe(next: (value: T) => Promise<void>): void {
        this.emitter.subscribe('async.event', (...args: any) => {
            return next.apply(null, args);
        });
    }

    subscribeOnce(next: (value: T) => Promise<void>): void {
        this.emitter.subscribeOnce('async.event', (...args: any) => {
            return next.apply(null, args);
        });
    }
}

export {
    AsyncSeriesEventEmitter
}
