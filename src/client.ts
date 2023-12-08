// MOST Web Framework 2.0 Copyright (c) 2017-2021, THEMOST LP All rights reserved

import {ClientDataServiceBase, ClientDataContextBase, TextUtils, DataServiceQueryParams, DataServiceExecuteOptions, Args,
    ClientDataContextOptions,
    configurable,
    enumerable,
    DataServiceHeaders} from './common';
import {EdmSchema} from './metadata';
import { OpenDataQuery, OpenDataQueryFormatter, QueryFunc } from '@themost/query'
import {SyncSeriesEventEmitter} from '@themost/events';

interface ServiceContainer {
    _service?: ClientDataServiceBase
}

export interface ObjectState {
    $state: number
}

export interface NameReference {
    $name: string
}

export interface QueryFuncParams {
    [key: string]: any;
}

class ClientQueryExpression {
    public left: any;
    public op: string;
    public lop: string;
    public right: any;
}

export interface ListResponse<T> {
    total?: number;
    skip?: number;
    value?: T[];
}


export class ClientDataQueryable {

    public static parse(u: string, service?: ClientDataServiceBase): ClientDataQueryable {
        let uri: URL;
        if (TextUtils.isAbsoluteURI(u)) {
            uri = new URL(u);
        } else {
            const base = service && service.getBase();
            uri = new URL(u, base || 'http://0.0.0.0');
        }
        const result = new ClientDataQueryable('Model', service || new ParserDataService(uri.protocol ? uri.origin : '/'));
        uri.searchParams.forEach((value: string, key: string) => {
            if (/[+-]?\d+/.test(value)) {
                result.setParam(key, parseInt(value, 10));
            } else {
                result.setParam(key, value);
            }
        });
        result.setUrl(uri.pathname);
        return result;
    }

    public static create(model: string, service?: ClientDataServiceBase): ClientDataQueryable {
        return new ClientDataQueryable(model, service);
    }

    private readonly _model: string;
    private _url: string;
    private readonly _params: DataServiceQueryParams;
    private $prepare: string;
    private _privates: ClientQueryExpression;

    public readonly resolvingMember = new SyncSeriesEventEmitter<{ target: ClientDataQueryable, member: string }>();
    public readonly resolvingJoinMember = new SyncSeriesEventEmitter<{ target: ClientDataQueryable, member: string, fullyQualifiedMember?: string }>();
    public readonly resolvingMethod = new SyncSeriesEventEmitter<{ target: ClientDataQueryable, method: string }>();


    constructor(model: string, service: ClientDataServiceBase) {
        Args.notEmpty(model, 'Model');
        this._model = model;
        Args.notNull(service, 'Data Service');
        Object.defineProperty(this, '_service', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: service
        })
        const options = this.service.getOptions();
        if (!!options.useMediaTypeExtensions) {
            this._url = TextUtils.format('%s/index.json', this._model);
        } else {
            this._url = TextUtils.format('%s', this._model);
        }
        // init params
        this._params = { } as DataServiceQueryParams;
        // init privates
        this._privates = new ClientQueryExpression();
        // add where expression event
    }


    public toString() {
        const uri = this.getService().resolve(this._url);
        const params = this.getParams();
        let search = '';
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                search = search.concat(key, '=', params[key], '&');
            }
        }
        if (search.length) {
            return uri.concat('?', search.replace(/&$/, ''));
        }
        return uri;
    }

    public toExpand() {
        const model = this.getModel();
        const params = this.getParams();
        let search = '';
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                search = search.concat(key, '=', params[key], ';');
            }
        }
        if (search.length) {
            return model.concat('(', search.replace(/;$/, ''), ')');
        }
        return model;
    }

    public takeNext(n: number) {
        const p = this.getParams();
        return this.take(n).skip((p.$skip ? p.$skip : 0) + n);
    }

    public takePrevious(n: number) {
        const p = this.getParams();
        if (p.$skip > 0) {
            if (n <= p.$skip) {
                this.skip(p.$skip - n);
                return this.take(n);
            }
        }
        return this;
    }

    /**
     * @returns {ClientDataServiceBase}
     */
    public getService(): ClientDataServiceBase {
        return this.service;
    }

    @configurable(false)
    @enumerable(false)
    public get service(): ClientDataServiceBase {
        return (this as ServiceContainer)._service;
    }

    /**
     * @returns {DataServiceQueryParams}
     */
    public getParams(): DataServiceQueryParams {
        if (typeof this.$prepare === 'string' && this.$prepare.length) {
            if (typeof this._params.$filter === 'string' && this._params.$filter) {
                return Object.assign({
                    },
                    this._params,
                    {
                    $filter: `(${this.$prepare}) and (${this._params.$filter})`
                });
            } else {
                return Object.assign({

                }, this._params, {
                    $filter: this.$prepare
                });
            }

        }
        const result: DataServiceQueryParams = Object.assign({ }, this._params);
        Object.keys(result).forEach((key: string) => {
            if (Object.prototype.hasOwnProperty.call(result, key) && result[key] == null) {
                delete result[key];
            }
        });
        return result;
    }

    /**
     * @returns {ClientDataQueryable}
     */
    public setParam(name: string, value: any): ClientDataQueryable {
        if (/^\$/.test(name)) {
            this._params[name] = value;
        } else {
            this._params['$' + name] = value;
        }
        return this;
    }

    /**
     * @returns {ClientDataQueryable}
     */
    public setQueryParams(queryParams: any): ClientDataQueryable {
        Object.assign(this._params, queryParams);
        return this;
    }

    /**
     * Gets a string which represents the name of the data model associated with this object.
     * @returns {string}
     */
    public getModel(): string {
        return this._model;
    }

    /**
     * Gets a string which represents the relative URL associated with this object.
     * @returns {string}
     */
    public getUrl(): string {
        return this._url;
    }

    /**
     * Sets the relative URL associated with this object.
     * @param value - A string which represents a relative URI.
     * @returns ClientDataQueryable
     */
    public setUrl(value: string) {
        Args.notEmpty(value, 'URL');
        Args.check(!TextUtils.isAbsoluteURI(value), 'URL must be a relative URI');
        this._url = value;
        return this;
    }

    private getOpenDataQuery() {
        const q = new OpenDataQuery().from('Thing').select('*');
        q.resolvingMember.subscribe((event) => {
            const newEvent = {
                target: this,
                member: event.member
            }
            this.resolvingMember.emit(newEvent);
            event.member = newEvent.member;
        });
        q.resolvingJoinMember.subscribe((event) => {
            const newEvent = {
                target: this,
                member: event.member,
                fullyQualifiedMember: event.fullyQualifiedMember
            }
            this.resolvingJoinMember.emit(newEvent);
            event.member = newEvent.member;
            event.fullyQualifiedMember = newEvent.fullyQualifiedMember;
        });
        q.resolvingMethod.subscribe((event) => {
            const newEvent = {
                target: this,
                method: event.method
            }
            this.resolvingMethod.emit(newEvent);
            event.method = newEvent.method;
        });
        return q;
    }

    public where<T>(expr: (string | QueryFunc<T>), params?: QueryFuncParams): this {
        if (typeof expr === 'function') {
            const q = this.getOpenDataQuery().where(expr, params);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            this.setParam('$filter', queryParams.$filter);
            return this;
        }
        this._privates.left = expr;
        return this;
    }

    public and(name: string): ClientDataQueryable {
        Args.notEmpty(name, 'Left operand');
        this._privates.left = name;
        this._privates.lop = 'and';
        return this;
    }

    public andAlso(name: string): ClientDataQueryable {
        Args.notEmpty(name, 'Left operand');
        this._privates.left = name;
        this._privates.lop = 'and';
        if (!TextUtils.isNullOrUndefined(this._params.$filter)) {
            this._params.$filter = '(' + this._params.$filter + ')';
        }
        return this;
    }

    public or(name: string): ClientDataQueryable {
        Args.notEmpty(name, 'Left operand');
        this._privates.left = name;
        this._privates.lop = 'or';
        return this;
    }

    public orElse(name: string): ClientDataQueryable {
        Args.notEmpty(name, 'Left operand');
        this._privates.left = name;
        this._privates.lop = 'or';
        if (!TextUtils.isNullOrUndefined(this._params.$filter)) {
            this._params.$filter = '(' + this._params.$filter + ')';
        }
        return this;
    }



    public equal(value: any): ClientDataQueryable {
        return this.compare_('eq', value);
    }

    public notEqual(value: any): ClientDataQueryable {
        return this.compare_('ne', value);
    }

    public greaterThan(value: any): ClientDataQueryable {
        return this.compare_('gt', value);
    }

    public greaterOrEqual(value: any): ClientDataQueryable {
        return this.compare_('ge', value);
    }

    public lowerThan(value: any): ClientDataQueryable {
        return this.compare_('lt', value);
    }

    public lowerOrEqual(value: any): ClientDataQueryable {
        return this.compare_('le', value);
    }

    /**
     * @param {*} value1
     * @param {*} value2
     * @returns {ClientDataQueryable}
     */
    public between(value1: any, value2: any): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        // generate new filter
        const s = ClientDataQueryable.create(this.getModel(), this.getService())
            .where(this._privates.left).greaterOrEqual(value1)
            .and(this._privates.left).lowerOrEqual(value2).toFilter();
        this._privates.lop = this._privates.lop || 'and';
        if (this._params.$filter) {
            this._params.$filter = '(' + this._params.$filter + ') ' + this._privates.lop + ' (' + s + ')';
        } else {
            this._params.$filter = '(' + s + ')';
        }
        // clear object
        this._privates.left = null; this._privates.op = null; this._privates.right = null; this._privates.lop = null;
        return this;
    }

    public toFilter(): string {
        return this.getParams().$filter;
    }

    public contains(value: any): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.op = 'ge';
        this._privates.left = TextUtils.format('indexof(%s,%s)', this._privates.left, this._escape(value));
        this._privates.right = 0;
        return this.append_();
    }



    public getDate(): ClientDataQueryable {
        return this.aggregate_('date');
    }

    public getDay(): ClientDataQueryable {
        return this.aggregate_('day');
    }

    public getMonth(): ClientDataQueryable {
        return this.aggregate_('month');
    }

    public getYear(): ClientDataQueryable {
        return this.aggregate_('year');
    }

    public getFullYear(): ClientDataQueryable {
        return this.aggregate_('year');
    }

    public getHours(): ClientDataQueryable {
        return this.aggregate_('hour');
    }

    public getMinutes(): ClientDataQueryable {
        return this.aggregate_('minute');
    }

    public getSeconds(): ClientDataQueryable {
        return this.aggregate_('second');
    }

    public length(): ClientDataQueryable {
        return this.aggregate_('length');
    }

    public trim(): ClientDataQueryable {
        return this.aggregate_('trim');
    }

    public toLocaleLowerCase(): ClientDataQueryable {
        return this.aggregate_('tolower');
    }

    public toLowerCase(): ClientDataQueryable {
        return this.aggregate_('tolower');
    }

    public toLocaleUpperCase(): ClientDataQueryable {
        return this.aggregate_('toupper');
    }

    public toUpperCase(): ClientDataQueryable {
        return this.aggregate_('toupper');
    }

    public round(): ClientDataQueryable {
        return this.aggregate_('round');
    }

    public floor(): ClientDataQueryable {
        return this.aggregate_('floor');
    }

    public ceil(): ClientDataQueryable {
        return this.aggregate_('ceiling');
    }

    public indexOf(s: string): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.left = TextUtils.format('indexof(%s,%s)', this._privates.left, this._escape(s));
        return this;
    }

    public substr(pos: number, length: number): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.left = TextUtils.format('substring(%s,%s,%s)', this._privates.left, pos, length);
        return this;
    }

    public startsWith(s: string): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.left = TextUtils.format('startswith(%s,%s)', this._privates.left, this._escape(s));
        return this;
    }

    public endsWith(s: string): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.left = TextUtils.format('endswith(%s,%s)', this._privates.left, this._escape(s));
        return this;
    }

    // public select<T>(expr: QueryFunc<T>, params: QueryFuncParams): this;
    // public select(...args: string[]): this;
    public select<T>(...args: (string | QueryFunc<T> | QueryFuncParams)[]): this {
        if (typeof args[0] === 'function') {
            const q = this.getOpenDataQuery();
            q.select(...args);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            this._params.$select = queryParams.$select;
            return this;
        }
        Args.notNull(args, 'Select arguments');
        Args.check(args.length > 0, 'Select arguments may not be empty');
        const arr = [];
        for (const arg of args) {
            Args.check(typeof arg === 'string', 'Invalid select argument. Expected string.');
            arr.push(arg);
        }
        this._params.$select = arr.join(',');
        return this;
    }

    public groupBy<T>(arg1: QueryFunc<T>, params?: QueryFuncParams): this;
    public groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, params?: QueryFuncParams): this;
    public groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>, params?: QueryFuncParams): this;
    public groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, params?: QueryFuncParams): this;
    public groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, params?: QueryFuncParams): this;
    public groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, arg6: QueryFunc<T>, params?: QueryFuncParams): this;
    public groupBy<T>(arg1: QueryFunc<T>, arg2: QueryFunc<T>, arg3: QueryFunc<T>,
               arg4: QueryFunc<T>, arg5: QueryFunc<T>, arg6: QueryFunc<T> , arg7: QueryFunc<T>, params?: QueryFuncParams): ClientDataQueryable;
    public groupBy(...args: string[]): this
    public groupBy<T>(...args: (string | QueryFunc<T> | QueryFuncParams)[]): this {
        if (typeof args[0] === 'function') {
            const q = this.getOpenDataQuery();
            q.groupBy(...args);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            this._params.$groupby = queryParams.$groupby;
            return this;
        }
        Args.check(args.length > 0, 'Group by arguments may not be empty');
        const arr = [];
        for (const arg of args) {
            Args.check(typeof arg === 'string', 'Invalid argument. Expected string.');
            arr.push(arg);
        }
        this._params.$groupby = arr.join(',');
        return this;
    }

    public expand<T>(...args: (string | OpenDataQuery | QueryFunc<T>)[]): this {
        Args.notNull(args, 'Expand arguments');
        Args.check(args.length > 0, 'Expand arguments may not be empty');
        const q = this.getOpenDataQuery();
        q.expand(...(args as any[]));
        const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
        this._params.$expand = queryParams.$expand;
        return this;
    }

    public orderBy<T>(expr: QueryFunc<T>, params?: QueryFuncParams): this;
    public orderBy(expr: string): this;
    public orderBy<T>(expr: (QueryFunc<T> | string), params?: QueryFuncParams): this {
        if (typeof expr === 'function') {
            const q = this.getOpenDataQuery();
            q.orderBy(expr, params);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            this._params.$orderby = queryParams.$orderby;
            return this;
        }
        Args.check(typeof expr === 'string', `Invalid order by argument. Expected string`);
        this._params.$orderby = expr.toString();
        return this;
    }

    public thenBy<T>(expr: QueryFunc<T>, params?: QueryFuncParams): this;
    public thenBy(expr: string): this;
    public thenBy<T>(expr: (QueryFunc<T> | string), params?: QueryFuncParams): this {
        if (typeof expr === 'function') {
            const q = this.getOpenDataQuery();
            q.orderBy(expr, params);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            if (this._params.$orderby) {
                this._params.$orderby += ',';
                this._params.$orderby += queryParams.$orderby;
            } else {
                this._params.$orderby = queryParams.$orderby;
            }
            return this;
        }
        Args.check(typeof expr === 'string', `Invalid order by argument. Expected string`);
        this._params.$orderby += (this._params.$orderby ? ',' + expr.toString() : expr.toString());
        return this;
    }

    public orderByDescending<T>(expr: QueryFunc<T>, params?: QueryFuncParams): this;
    public orderByDescending(expr: string): this;
    public orderByDescending<T>(expr: (QueryFunc<T> | string), params?: QueryFuncParams): this {
        if (typeof expr === 'function') {
            const q = this.getOpenDataQuery().orderByDescending(expr, params);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            this._params.$orderby = queryParams.$orderby;
            return this;
        }
        Args.check(typeof expr === 'string', `Invalid order by argument. Expected string`);
        this._params.$orderby = `${expr} desc`;
        return this;
    }

    public thenByDescending<T>(expr: QueryFunc<T>, params?: QueryFuncParams): this;
    public thenByDescending(expr: string): this;
    public thenByDescending<T>(expr: (QueryFunc<T> | string), params?: QueryFuncParams): this {
        if (typeof expr === 'function') {
            const q = this.getOpenDataQuery().orderByDescending(expr, params);
            const queryParams: DataServiceQueryParams = new OpenDataQueryFormatter().format(q);
            if (this._params.$orderby) {
                this._params.$orderby += ',';
                this._params.$orderby += queryParams.$orderby;
            } else {
                this._params.$orderby = queryParams.$orderby;
            }
            return this;
        }
        Args.check(typeof expr === 'string', `Invalid order by argument. Expected string`);
        this._params.$orderby += (this._params.$orderby ? ',' + expr : expr) + ' desc';
        return this;
    }

    public skip(num: number): ClientDataQueryable {
        this._params.$skip = num;
        return this;
    }

    public take(num: number): ClientDataQueryable {
        this._params.$top = num;
        return this;
    }

    public first(): Promise<any> {
        delete this._params.$top;
        delete this._params.$skip;
        delete this._params.$count;
        this._params.$first = true;
        return this.getService().execute({
            method: 'GET',
            url: this.getUrl(),
            data: this.getParams(),
            headers: {}
        });
    }

    public list(): Promise<any> {
        delete this._params.$first;
        this._params.$count = true;
        return this.getService().execute({
            method: 'GET',
            url: this.getUrl(),
            data: this.getParams(),
            headers: {}
        });
    }

    public item(): Promise<any> {
        return this.first();
    }

    public getItem(): Promise<any> {
        // delete $first param
        delete this._params.$first;
        // delete $count param
        delete this._params.$count;
        // get first item only
        return this.take(1).skip(0).getItems().then((result: { value?: any }) => {
            // if result and result.value is array
            if (result && Array.isArray(result.value)) {
                // get first item only
                return Promise.resolve(result.value[0]);
            }
            if (Array.isArray(result)) {
                return Promise.resolve(result[0]);
            }
            // otherwise return result
            return Promise.resolve(result);
        });
    }

    public items(): Promise<any> {
        delete this._params.$first;
        this._params.$count = false;
        return this.getService().execute({
            method: 'GET',
            url: this.getUrl(),
            data: this.getParams(),
            headers: {}
        });
    }
    public getItems(): Promise<any> {
        return this.items().then((result: any) => {
            // if current service uses response conversion
            if (this.getService().getOptions().useResponseConversion) {
                // validate response
                // if response has property value and this property is an array
                const res: { value?: any } = result;
                if (res && Array.isArray(res.value)) {
                    // this operation is equivalent with DataModel.getItems() and DataQueryable.getItems of @themost/data
                    // return this array
                    return Promise.resolve(res.value);
                }
            }
            return Promise.resolve(result);
        });
    }

    public getList(): Promise<any> {
        return this.list().then( (result: { [key: string]: any }) => {
            // if current service uses response conversion
            if (this.getService().getOptions().useResponseConversion) {
                // validate response
                // if result has OData paging attributes
                if (Object.prototype.hasOwnProperty.call(result, '@odata.count') &&
                Object.prototype.hasOwnProperty.call(result, '@odata.skip')) {
                    // convert result to EntitySetResponse
                    return Promise.resolve({
                        total: result['@odata.count'],
                        skip: result['@odata.skip'],
                        value: result.value
                    } as ListResponse<any>);
                }
            }
            return Promise.resolve(result);
        });
    }

    public filter(s: string): ClientDataQueryable {
        Args.notEmpty('s', 'Filter expression');
        this._params.$filter = s;
        return this;
    }

    public levels(n: number): ClientDataQueryable {
        Args.Positive(n, 'Levels');
        this._params.$levels = n;
        return this;
    }

    public prepare(or?: boolean): ClientDataQueryable {
        const lop = or ? 'or' : 'and';
        if (typeof this._params.$filter === 'string' && this._params.$filter.length) {
            if (typeof this.$prepare === 'string' && this.$prepare.length) {
                this.$prepare = `${this.$prepare} ${lop} ${this._params.$filter}`;
            } else {
                this.$prepare = this._params.$filter;
            }
        }
        delete this._params.$filter;
        return this;
    }

    private aggregate_(fn: string): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.left = TextUtils.format('%s(%s)', fn, this._privates.left);
        return this;
    }

    private compare_(op: any, value: any): ClientDataQueryable {
        Args.notNull(this._privates.left, 'The left operand');
        this._privates.op = op;
        this._privates.right = value; return this.append_();
    }

    private append_() {
        Args.notNull(this._privates.left, 'Left operand');
        Args.notNull(this._privates.op, 'Comparison operator');
        let expr;
        if (Array.isArray(this._privates.right)) {
            Args.check((this._privates.op === 'eq') || (this._privates.op === 'ne'), 'Wrong operator. Expected equal or not equal');
            Args.check(this._privates.right.length > 0, 'Array may not be empty');
            const arr = this._privates.right.map((x) => {
                return this._privates.left + ' ' + this._privates.op + ' ' + this._escape(x);
            });
            if (this._privates.op === 'eq') {
                expr = '(' + arr.join(' or ') + ')';
            } else {
                expr = '(' + arr.join(' or ') + ')';
            }
        } else {
            expr = this._privates.left + ' ' + this._privates.op + ' ' + this._escape(this._privates.right);
        }
        this._privates.lop = this._privates.lop || 'and';
        if (TextUtils.isNotEmptyString(this._params.$filter)) {
            this._params.$filter = this._params.$filter + ' ' + this._privates.lop + ' ' + expr;
        } else {
            this._params.$filter = expr;
        }
        // clear object
        this._privates.left = null; this._privates.op = null; this._privates.right = null;
        return this;
    }

    private _escape(val: any): any {
        if ((val == null) || (typeof val === 'undefined')) {
            return 'null';
        }
        if (typeof val === 'boolean') {
            return (val) ? 'true' : 'false';
        }
        if (typeof val === 'number') {
            return val + '';
        }
        if (val instanceof Date) {
            const dt = val;
            const year   = dt.getFullYear();
            const month  = TextUtils.zeroPad(dt.getMonth() + 1, 2);
            const day    = TextUtils.zeroPad(dt.getDate(), 2);
            const hour   = TextUtils.zeroPad(dt.getHours(), 2);
            const minute = TextUtils.zeroPad(dt.getMinutes(), 2);
            const second = TextUtils.zeroPad(dt.getSeconds(), 2);
            const millisecond = TextUtils.zeroPad(dt.getMilliseconds(), 3);
            // format timezone
            const offset = (new Date()).getTimezoneOffset();
            const timezone = (offset >= 0 ? '+' : '') + TextUtils.zeroPad(Math.floor(offset / 60), 2) +
                ':' + TextUtils.zeroPad(offset % 60, 2);
            return '\'' + year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + millisecond + timezone + '\'';
        }
        if (val instanceof Array) {
            const values: string[] = [];
            val.forEach((x) => {
                values.push(this._escape(x));
            });
            return values.join(',');
        }
        if (typeof val === 'string') {
            const res = val.replace(/[\0\n\r\b\t\\'"\x1a]/g, (s) => {
                switch (s) {
                    case '\0': return '\\0';
                    case '\n': return '\\n';
                    case '\r': return '\\r';
                    case '\b': return '\\b';
                    case '\t': return '\\t';
                    case '\x1a': return '\\Z';
                    default: return '\\' + s;
                }
            });
            return '\'' + res + '\'';
        }
        // otherwise get valueOf
        if (Object.prototype.hasOwnProperty.call(val, '$name')) {
            return (val as NameReference).$name;
        } else {
            return this._escape((val as unknown).valueOf());
        }
    }
}

export class ClientDataModel {

    private readonly _name: string;

    constructor(name: string, service: ClientDataServiceBase) {
        this._name = name;
        Object.defineProperty(this, '_service', {
            configurable: false,
            enumerable: false,
            value: service
        });
    }

    @configurable(false)
    @enumerable(false)
    get service(): ClientDataServiceBase {
        return (this as ServiceContainer)._service;
    }

    /**
     * @returns {ClientDataServiceBase}
     */
    public getService(): ClientDataServiceBase {
        return (this as ServiceContainer)._service;
    }

    public getName(): string {
        return this._name;
    }

    /**
     * @param {DataServiceQueryParams} params
     * @returns {ClientDataQueryable}
     */
    public asQueryable(params?: DataServiceQueryParams): ClientDataQueryable {
        const q =  ClientDataQueryable.create(this.getName(), this.service);
        if (params) {
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    q.setParam(key, params[key]);
                }
            }
        }
        return q;
    }

    /**
     * @returns {Promise}
     */
    public getItems(): Promise<any> {
        return this.asQueryable().getItems();
    }

    /**
     * @returns {Promise}
     */
    public getList(): Promise<any> {
        return this.asQueryable().getList();
    }

    public where<T>(expr: (string | QueryFunc<T>), params?: QueryFuncParams): ClientDataQueryable {
        return this.asQueryable().where(expr, params);
    }

    public select<T>(expr: QueryFunc<T>, params?: QueryFuncParams): ClientDataQueryable;
    public select(...expr: (string)[]): ClientDataQueryable;
    public select<T>(...args: (string | QueryFunc<T> | QueryFuncParams)[]): ClientDataQueryable {
        return this.asQueryable().select(...args);
    }

    public skip(num: number): ClientDataQueryable {
        return this.asQueryable().skip(num);
    }

    public take(num: number): ClientDataQueryable {
        return this.asQueryable().take(num);
    }

    public getUrl() {
        if (this.service.getOptions().useMediaTypeExtensions) {
            return TextUtils.format('%s/index.json', this.getName());
        } else {
            return TextUtils.format('%s', this.getName());
        }
    }

    public save(obj: any): Promise<any> {
        return this.getService().execute({
            method: 'POST',
            url: this.getUrl(),
            data: obj as unknown,
            headers: {}
        });
    }

    private setState(obj: any, state: number) {
        if (obj == null) {
            return;
        }
        if (Array.isArray(obj)) {
            obj.forEach((x) => {
                Object.assign(x, { "$state": state });
            });
        } else {
            Object.assign(obj, { "$state": state });
        }
    }

    private clearState(obj: any) {
        if (obj == null) {
            return;
        }
        if (Array.isArray(obj)) {
            obj.forEach((x) => {
                if (Object.prototype.hasOwnProperty.call(x, '$state')) {
                    delete (x as ObjectState).$state;
                }
            });
        } else {
            delete (obj as ObjectState).$state;
        }
    }

    public async insert(obj: any): Promise<any> {
        // set state to inserted
        this.setState(obj, 1);
        // execute insert
        const result = await this.getService().execute({
            method: 'POST',
            url: this.getUrl(),
            data: obj,
            headers: {}
        });
        // clear state
        this.clearState(result);
        return result;
    }

    public async update(obj: any): Promise<any> {
        // set state to updated
        this.setState(obj, 2);
        // execute update
        const result = await this.getService().execute({
            method: 'POST',
            url: this.getUrl(),
            data: obj,
            headers: {}
        });
        // clear state
        this.clearState(result);
        return result;
    }

    public execute(payload: any, executeExtras?: {
        method?: 'POST' | 'PUT'
        headers?: any;
    }): Promise<any> {
        return this.getService().execute({
            method: (executeExtras && executeExtras.headers) || 'POST',
            url: this.getUrl(),
            data: payload,
            headers: (executeExtras && executeExtras.headers) || {}
        });
    }

    public schema(): Promise<any> {
        return this.getService().execute({ method: 'GET',
            url: TextUtils.format('%s/schema.json', this.getName()),
            data: null,
            headers: {}
        });
    }

    public remove(obj: any): Promise<any> {
        return this.getService().execute({ method: 'DELETE',
            url: this.getUrl(),
            data: obj,
            headers: {}
        });
    }

    public levels(n: number): ClientDataQueryable {
        Args.Positive(n, 'Levels');
        return this.asQueryable().levels(n);
    }


}

export class ClientDataContext implements ClientDataContextBase {

    protected metadata: EdmSchema;
    private options: ClientDataContextOptions;

    constructor(service: ClientDataServiceBase, options?: ClientDataContextOptions) {
        Object.defineProperty(this, '_service', {
            configurable: false,
            enumerable: false,
            value: service
        });
        this.options = options;
    }

    @configurable(false)
    @enumerable(false)
    get service(): ClientDataServiceBase {
        return (this as ServiceContainer)._service;
    }

    public setBasicAuthorization(username: string, password: string): ClientDataContext {
        this.service.setHeader('Authorization', 'Basic ' + TextUtils.toBase64(username + ':' + password));
        return this;
    }

    public setBearerAuthorization(access_token: string): ClientDataContext {
        this.service.setHeader('Authorization', 'Bearer ' + access_token);
        return this;
    }

    /**
     * Gets a string which represents the base URL of the MOST Web Application Server.
     * @returns {string}
     */
    public getBase(): string {
        return this.service.getBase();
    }

    /**
     * Sets a string which represents the base URL of the MOST Web Application Server.
     */
    public setBase(value: string): ClientDataContextBase {
        this.service.setBase(value);
        return this;
    }

    /**
     * Gets the instance of ClientDataService class which is associated with this data context.
     * @returns {ClientDataServiceBase}
     */
    public getService(): ClientDataServiceBase {
        return (this as ServiceContainer)._service;
    }

    /**
     * Gets an instance of ClientDataModel class
     * @param name {string|*} - A string which represents the name of the data model.
     * @returns {ClientDataModel}
     */
    public model(name: string): ClientDataModel {
        Args.notEmpty(name, 'Model name');
        return new ClientDataModel(name, this.service);
    }

    public getMetadata(force = false): Promise<EdmSchema> {
        if (this.metadata) {
            if (!force) {
                return Promise.resolve(this.metadata);
            }
        }
        return this.service.getMetadata().then( (result) => {
            this.metadata = result;
            return Promise.resolve(this.metadata);
        });
    }

}

export class ClientDataService implements ClientDataServiceBase {


    private _base: string;
    private readonly _options: ClientDataContextOptions;
    private readonly _headers: DataServiceHeaders;

    constructor(base: string, options?: ClientDataContextOptions) {
        this._headers = {};
        this._options = options || {
            useMediaTypeExtensions: false
        };
        if (typeof base === 'undefined' || base == null) {
            this._base = '/';
        } else {
            this._base = base;
            if (!/\/$/.test(this._base)) {
                this._base += '/';
            }
        }
    }

    public getOptions(): ClientDataContextOptions {
        return this._options;
    }

    public setHeader(name: string, value: string) {
        this._headers[name] = value;
    }

    public getHeaders(): DataServiceHeaders {
        return this._headers;
    }

    public getBase(): string {
        return this._base;
    }

    /**
     * Sets a string which represents the base URL of a client data service.
     */
    public setBase(value: string): ClientDataService {
        // validate
        Args.notEmpty(value, 'Base URL');
        // set service base
        this._base = /\/$/.test(value) ? value : value + '/';
        // return this
        return this;
    }

    public resolve(relative: string) {
        if (typeof relative === 'string' && relative.length > 0) {
            if (/^\//.test(relative)) {
                return this.getBase() + relative.substring(1);
            } else {
                return this.getBase() + relative;
            }
        }
        throw  new Error('Invalid argument. Expected a not empty string.');
    }


    /**
     * @abstract
     * @param options
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public execute(options: DataServiceExecuteOptions): Promise<any> {
        throw new Error('Class does not implement inherited abstract method.');
    }

    /**
     * @abstract
     */
    public getMetadata(): Promise<EdmSchema> {
        throw new Error('Class does not implement inherited abstract method.');
    }

}

export class ParserDataService extends ClientDataService {

    constructor(base: string, options?: ClientDataContextOptions) {
        super(base, options);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public execute(_options: DataServiceExecuteOptions): Promise<any> {
        throw new Error('Method not allowed.');
    }

}
