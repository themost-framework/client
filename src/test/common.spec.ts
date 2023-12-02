import { ResponseError } from '../index';

describe('ResponseError', () => {
    it('should create a ResponseError instance with the provided message and statusCode', () => {
        const message = 'Test error message';
        const statusCode = 404;
        const error = new ResponseError(message, statusCode);
        expect(error).toBeInstanceOf(ResponseError);
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);
    });
});