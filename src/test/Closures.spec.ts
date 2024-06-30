import { any, count } from '@themost/query';
import {ClientDataContext, ClientDataQueryable, ClientDataService, DataServiceQueryParams, ParserDataService} from '@themost/client';

fdescribe('Closures', () => {
    let service: ClientDataService;
    let context: ClientDataContext;
    beforeEach(() => {
        service = new ParserDataService('/', {
            useMediaTypeExtensions: false,
        });
        context = new ClientDataContext(service);
    });
    it('should use where closure', () => {
        const query = new ClientDataQueryable('people', service);
        expect(query
            .where((x:{ email: string }) => x.email === 'alexis.rees@example.com')
            .toString()).toEqual('/people?$filter=email eq \'alexis.rees@example.com\'');
    });

    it('should use where closure with params', () => {
        const email = 'alexis.rees@example.com';
        expect(context.model('People')
            // eslint-disable-next-line @typescript-eslint/no-shadow
            .where((x:{ email: string }, email: string) => x.email === email, {
                email
            })
            .toString()).toEqual('/People?$filter=email eq \'alexis.rees@example.com\'');
    });

    it('should use where closure and object destructuring', () => {
        expect(context.model('People').where<{ email: string }>(({email}, emailAddress: string) => {
                return email === emailAddress;
            }, 'alexis.rees@example.com').toString()).toEqual('/People?$filter=email eq \'alexis.rees@example.com\'');
    });

    it('should use select closure', () => {
        const query = context.model('People')
        .select(({id, familyName, givenName}) => ({
            id,
            familyName,
            givenName
        })).where<{ email: string }>(({email}, emailAddress) => {
            return email === emailAddress;
        }, {
            emailAddress: 'alexis.rees@example.com'
        });
        expect(query.toString()).toEqual('/People?$select=id,familyName,givenName&$filter=email eq \'alexis.rees@example.com\'');
    });

    it('should use orderBy closure', () => {
        const query = context.model('People')
        .select(({id, familyName, givenName}) => ({
            id,
            familyName,
            givenName
        })).where(({email}, emailAddress) => {
            return email === emailAddress;
        }, {
            emailAddress: 'alexis.rees@example.com'
        }).orderBy((x:{ familyName: string }) => x.familyName)
        .thenBy((x:{ givenName: string }) => x.givenName);
        const queryParams: DataServiceQueryParams = query.getParams();
        expect(queryParams.$filter).toEqual(`email eq 'alexis.rees@example.com'`);
        expect(queryParams.$orderby).toEqual(`familyName,givenName`);
        expect(queryParams.$select).toEqual(`id,familyName,givenName`);
    });

    it('should use orderByDescending closure', () => {
        const query = context.model('People')
        .select(({id, familyName, givenName}) => ({
            id,
            familyName,
            givenName
        })).where(({email}, emailAddress) => {
            return email === emailAddress;
        }, {
            emailAddress: 'alexis.rees@example.com'
        }).orderByDescending((x:{ familyName: string }) => x.familyName)
        .thenByDescending((x:{ givenName: string }) => x.givenName);
        const queryParams: DataServiceQueryParams = query.getParams();
        expect(queryParams.$orderby).toEqual(`familyName desc,givenName desc`);
    });

    it('should use groupBy closure', () => {
        let query = context.model('Orders')
        .select((x: { id: number, orderedItem: { name:string } }) => {
            return {
                product: x.orderedItem.name,
                total: count(x.id)
            }
        }).where((x: { orderDate: Date}) => {
            return x.orderDate.getFullYear() === 2019;
        }).groupBy((x: { id: number, orderedItem: { name:string } }) => x.orderedItem.name);
        let queryParams = query.getParams();
        expect(queryParams.$select).toEqual(`orderedItem/name as product,count(id) as total`);
        expect(queryParams.$filter).toEqual(`year(orderDate) eq 2019`);
        expect(queryParams.$groupby).toEqual(`orderedItem/name`);

        query = context.model('Orders')
        .select((x: { id: number, orderedItem: { name: string }, orderDate: Date }) => {
            return {
                product: x.orderedItem.name,
                month: x.orderDate.getMonth(),
                total: count(x.id)
            }
        }).where((x: { orderDate: Date}) => {
            return x.orderDate.getFullYear() === 2019;
        }).groupBy(
            (x: { orderedItem: { name: string } }) => x.orderedItem.name,
            (x: { orderDate: Date }) => x.orderDate.getMonth()
        );
        queryParams = query.getParams();
        expect(queryParams.$select).toEqual(`orderedItem/name as product,(month(orderDate) sub 1) as month,count(id) as total`);
        expect(queryParams.$filter).toEqual(`year(orderDate) eq 2019`);
        expect(queryParams.$groupby).toEqual(`orderedItem/name,(month(orderDate) sub 1)`);
    });

    it('should use expand closure', () => {
        const query = context.model('People')
        .where<{email: string}>(({email}, emailAddress) => {
            return email === emailAddress;
        }, {
            emailAddress: 'alexis.rees@example.com'
        }).expand((x: { address: any }) => x.address);
        const queryParams: DataServiceQueryParams = query.getParams();
        expect(queryParams.$expand).toEqual(`address`);
    });

    it('should use expand with nested expand', () => {
        const People = context.model('People');
        const query = People.where(({email}, emailAddress) => {
            return email === emailAddress;
        }, {
            emailAddress: 'alexis.rees@example.com'
        }).expand(any((x: { address: any }) => x.address)
            .select<{ id: number,streetAddress: any,addressLocalilty: any }>(({id, streetAddress, addressLocalilty}) => ({
                id, streetAddress, addressLocalilty
            }))
            .expand((x:{ addressCountry: any }) => x.addressCountry));
        const queryParams: DataServiceQueryParams = query.getParams();
        expect(queryParams.$expand).toEqual(`address($select=id,streetAddress,addressLocalilty;$expand=addressCountry)`);
    });

});
