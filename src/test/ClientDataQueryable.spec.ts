import { count } from '@themost/query';
import {ClientDataQueryable, ClientDataService, ParserDataService} from '@themost/client';

describe('ClientDataQueryable', () => {
    let service: ClientDataService;
    beforeEach(() => {
        service = new ParserDataService('/');
    });
    it('should create instance', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query).toBeTruthy();
    });
    it('should use create()', () => {
        const query = ClientDataQueryable.create('people', service);
        expect(query).toBeTruthy();
    });
    it('should use getService()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query.getService() instanceof ClientDataService).toBeTruthy();
    });
    it('should use getParams()', () => {
        const query = new ClientDataQueryable('people', service)
            .where('email').equal('alexis.rees@example.com');
        expect(query.getParams()).toBeTruthy();
        expect(query.getParams().$filter)
            .toBe('email eq \'alexis.rees@example.com\'');
    });
    it('should use setParam()', () => {
        const query = new ClientDataQueryable('orders', service);
        query.setParam('filter', 'orderStatus/alternateName eq \'OrderStatusDelivered\'');
        query.setParam('$orderby', 'dateCreated');
        expect(query.getParams()).toBeTruthy();
        expect(query.getParams().$filter)
            .toBe('orderStatus/alternateName eq \'OrderStatusDelivered\'');
        expect(query.getParams().$orderby)
            .toBe('dateCreated');
    });
    it('should use getModel()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query.getModel()).toBe('people');
    });
    it('should use toString()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query.toString()).toBe('/people');
    });
    it('should use where()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .where((x:{ email: string }) => x.email === 'alexis.rees@example.com')
            .toString()).toBe('/people?$filter=email eq \'alexis.rees@example.com\'');
    });
    it('should use and()', () => {
        const query = new ClientDataQueryable('orders', service);
        expect(query
            .where('orderStatus/alternateName').equal('OrderStatusDelivered')
            .and('customer/email').equal('alexis.rees@example.com')
            .toString())
            .toBe('/orders?$filter=orderStatus/alternateName eq \'OrderStatusDelivered\' ' +
                'and customer/email eq \'alexis.rees@example.com\'');
    });
    it('should use or()', () => {
        const query = new ClientDataQueryable('orders', service);
        expect(query
            .where((x: { orderStatus: { alternateName: string} }) => {
                return x.orderStatus.alternateName === 'OrderStatusDelivered' ||
                    x.orderStatus.alternateName === 'OrderStatusCancelled'
            })
            .toString())
            .toBe('/orders?$filter=(orderStatus/alternateName eq \'OrderStatusDelivered\' ' +
                'or orderStatus/alternateName eq \'OrderStatusCancelled\')');
    });
    it('should use orderBy()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .orderBy((x:{ familyName: string }) => x.familyName)
            .toString()).toBe('/people?$orderby=familyName');
    });
    it('should use thenBy()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .orderBy((x:{ familyName: string }) => x.familyName)
            .thenBy((x:{ givenName: string }) => x.givenName)
            .toString()).toBe('/people?$orderby=familyName,givenName');
    });
    it('should use orderByDescending()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .orderByDescending((x:{ familyName: string }) => x.familyName)
            .toString()).toBe('/people?$orderby=familyName desc');
    });
    it('should use thenByDescending()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .orderBy((x:{ familyName: string }) => x.familyName)
            .thenByDescending((x:{ givenName: string }) => x.givenName)
            .toString()).toBe('/people?$orderby=familyName,givenName desc');
    });
    it('should use expand()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .expand('address')
            .toString()).toBe('/people?$expand=address');
    });
    it('should use select()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .select(({id, familyName, givenName}) => {
                return {
                    id,
                    familyName,
                    givenName
                }
        }).toString()).toBe('/people?$select=id,familyName,givenName');
    });
    it('should use orderBy()', () => {
        const query = new ClientDataQueryable('orders', service);
        expect(query
            .select(({id, orderStatus}) => {
                return {
                    total: count(id),
                    orderStatus
                }
            }).groupBy((x:{ orderStatus:any }) => x.orderStatus)
            .toString()).toBe('/orders?$select=count(id) as total,orderStatus&$groupby=orderStatus');
    });
    it('should use take()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query.take(25).toString()).toBe('/people?$top=25');
    });
    it('should use skip()', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query.skip(50).take(25).toString()).toBe('/people?$skip=50&$top=25');
    });
    it('should use takeNext()', () => {
        const query = new ClientDataQueryable('people', service).skip(50).take(25);
        expect(query.takeNext(25).toString()).toBe('/people?$skip=75&$top=25');
    });
    it('should use takePrevious()', () => {
        const query = new ClientDataQueryable('people', service).skip(50).take(25);
        expect(query.takePrevious(25).toString()).toBe('/people?$skip=25&$top=25');
    });
    it('should use prepare()', () => {
        const query = new ClientDataQueryable('people', service)
            .where('orderStatus/alternateName').equal('OrderStatusCancelled').prepare();
        expect(query.getParams().$filter).toBe('orderStatus/alternateName eq \'OrderStatusCancelled\'');
        expect(query.toString()).toBe('/people?$filter=orderStatus/alternateName eq \'OrderStatusCancelled\'');
    });
    it('should use parse()', () => {
        const q = ClientDataQueryable.parse('/people?$filter=orderStatus/alternateName eq \'OrderStatusCancelled\'');
        expect(q).toBeTruthy();
        const queryParams = q.getParams();
        expect(queryParams.$filter).toBe('orderStatus/alternateName eq \'OrderStatusCancelled\'');
    });

    it('should use simple order by statement', () => {
        let query = new ClientDataQueryable('Orders', service).orderBy('dateCreated');
        expect(query.toString()).toBe('/Orders?$orderby=dateCreated');
        query = new ClientDataQueryable('Orders', service).orderByDescending('dateCreated');
        expect(query.toString()).toBe('/Orders?$orderby=dateCreated desc');
    });

});
