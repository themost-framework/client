import { ClientDataService } from '@themost/client';
import { ClientDataContextOptions, DataServiceExecuteOptions, DataServiceHeaders, ResponseError } from '@themost/client';
import { EdmSchema } from '@themost/client';
import { Request, Response } from 'superagent';
import { Buffer } from 'buffer';

const ISO_DATE_REGEX = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/gm;

function isDateString(value: any) {
    return typeof value === 'string' && value.match(ISO_DATE_REGEX);
}

/**
 * The default JSON reviver which converts an ISO date string to Date object
 * @param key
 * @param value
 */
function jsonReviver(key: string, value: any) {
    if (isDateString(value)) {
        return new Date(value);
    }
    return value;
}

/**
 * Represents a default data service that extends the ClientDataService class.
 */
class BasicDataService extends ClientDataService {

    // eslint-disable-next-line no-useless-constructor
    constructor(base: string, options?: ClientDataContextOptions) {
        super(base, options);
    }

    /**
     * Executes a request to the current data service
     * @param {DataServiceExecuteOptions} options - An object that represents the request options
     * @returns {Promise<any>}
     */
    async execute(options: DataServiceExecuteOptions): Promise<any> {
        // get method
        const method: string = options.method || 'GET';
        // get url
        const url: string = this.resolve(options.url);
        // get headers
        const headers: any = Object.assign({}, this.getHeaders()); // set service headers
        let query: any = null;
        let data: any = null;
        // assign options headers if any
        if (options.headers) {
            Object.assign(headers, {
                'Accept': 'application/json'
            }, options.headers);
        }

        if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
            data = Object.assign({}, options.data);
        } else {
            query = Object.assign({}, options.data);
        }
        const { useJsonReviver } = this.getOptions();
        const reviver = useJsonReviver || jsonReviver;
        const request = new Request(method, url).set(headers);
        let response: Response;
        try {
            if (query) {
                response = await request.query(query);
            }
            if (data) {
                response = await request.send(data);
            }
            if (response.status === 204) {
                return null;
            } else if (response.status === 200) {
                if (typeof reviver === 'function') {
                    // get response content type
                    const contentType: string | undefined = response.get('Content-Type');
                    if (contentType != null &&
                        (contentType.match(/^application\/json;?/) ||
                            contentType.match(/^application\/ld\+json;?/))) {
                        return JSON.parse(response.text, reviver);
                    }
                }
                return response.body;
            }
            throw new ResponseError('An error occurred', response.status);
        } catch (err) {
            const error:{
                statusText: string,
                status: number,
                ok: false,
                body: any,
                response: Response
            } = err;
            // get error content type
            const contentType: string | undefined = error.response.get('Content-Type');
            // if error content type is application/json
            if (/^application\/json;?/.test(contentType)) {
                // get error body
                const errorBody: { message?: string } = error.response.body;
                // if error body has message property
                if (errorBody && errorBody.message) {
                    // create response error
                    const responseError = new ResponseError(errorBody.message, error.status);
                    // assign attributes
                    Object.assign(responseError, errorBody);
                    Object.defineProperty(responseError, 'originalError', {
                        configurable: true,
                        enumerable: true,
                        value: err
                    });
                    // and throw
                    throw responseError;
                }
            }
            // otherwise throw error
            throw error;
        }
    }

    /**
     * Gets the metadata of the current data service
     * @returns {Promise<EdmSchema>}
     */
    async getMetadata(): Promise<EdmSchema> {
        const config: {
            method: string;
            url: string;
            headers: DataServiceHeaders;
        } = {
            method: 'GET',
            url: this.resolve('$metadata'),
            headers: this.getHeaders()
        };
        // get response
        const response = await new Request(config.method, config.url).set(config.headers);
        if (response.status === 200) {
            // load schema
            const bufferedResponse: { buffered: boolean } = response as any;
            if (bufferedResponse.buffered) {
                const text: string = Buffer.from(response.body, 'utf-8').toString();
                return EdmSchema.loadXML(text) as EdmSchema;
            }
            return EdmSchema.loadXML(response.text) as EdmSchema;
        }
        if (response.status === 204) {
            throw new ResponseError(
                'Unexpected metadata content. Service metadata is empty.',
                500
            );
        }
        // otherwise throw error
        throw new ResponseError(
            'An error occurred while getting service metadata',
            response.status
        );
    }
}

export {
    BasicDataService
}
