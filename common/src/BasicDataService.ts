import { ClientDataService } from '@themost/client';
import { ClientDataContextOptions, DataServiceExecuteOptions, DataServiceHeaders, ResponseError } from '@themost/client';
import { EdmSchema } from '@themost/client';
import axios, { AxiosRequestConfig } from 'axios';
import { Buffer } from 'buffer';

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
        // get absolute url
        const config: { method: string; url: string; headers: DataServiceHeaders; } = {
            method: options.method,
            url: this.resolve(options.url),
            headers: Object.assign({}, this.getHeaders()) // set service headers
        };
        // assign options headers if any
        if (options.headers) {
            Object.assign(config.headers, options.headers);
        }

        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
            // add body
            if (options.data != null) {
                Object.assign(config, {
                    data: options.data
                });
            }
        } else {
            // for HEAD, GET, OPTIONS, DELETE set query params
            if (options.data != null) {
                const queryParams = new URLSearchParams();
                const data: { [key: string]: any; } = options.data;
                Object.keys(data)
                    .filter((key) => {
                        return Object.prototype.hasOwnProperty.call(data, key);
                    })
                    .forEach((key) => {
                        queryParams.append(key, data[key]);
                    });
                // assign url with params
                Object.assign(config, {
                    url: config.url + '?' + queryParams.toString()
                });
            }
        }
        const reviver = this.getOptions().useJsonReviver;
        if (typeof reviver === 'function') {
            Object.assign(config, {
                responseType: 'arraybuffer'
            });
        }
        const response = await axios(config as AxiosRequestConfig);
        if (response.status === 204) {
            return null;
        } else if (response.status === 200) {
            if (typeof reviver === 'function') {
                // get response content type
                const contentType: string | undefined = response.headers['content-type'];
                if (contentType != null &&
                    (contentType.match(/^application\/json;?/) ||
                        contentType.match(/^application\/ld\+json;?/))) {
                    const buffer = Buffer.from(response.data, 'binary');
                    return JSON.parse(buffer.toString(), reviver);
                }
            }
            // otherwise return response data
            return response.data;
        }
        // otherwise throw error
        throw new ResponseError(
            'An error occurred while getting service metadata',
            response.status
        );
    }

    /**
     * Gets the metadata of the current data service
     * @returns {Promise<EdmSchema>}
     */
    async getMetadata(): Promise<EdmSchema> {
        const config: any = {
            method: 'GET',
            url: this.resolve('$metadata'),
            headers: this.getHeaders()
        };
        // get response
        const response = await axios(config);
        if (response.status === 200) {
            // load schema
            return EdmSchema.loadXML(response.data) as EdmSchema;
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
