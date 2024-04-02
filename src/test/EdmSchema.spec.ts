import {EdmSchema} from '@themost/client';
import {TestContext} from './TestUtils';

class Thing {
    id?: number;
    name?: string;
    description?: string;
    createdBy?: number;
    modifiedBy?: number;
    dateCreated?: Date;
    dateModified?: Date;
    sameAs?: string;
    url?: string;
    image?: string;
    additionalType?: string;
    identifier?: string;
    alternateName?: string;
    disambiguatingDescription?: string;
}

@EdmSchema.entitySet('Products')
class Product extends Thing {
    model?: string;
    productID?: string;
    category?: string;
    releaseDate?: Date;
    discontinued?: boolean;
    price?: number;
    isRelatedTo?: Product | number;
    isSimilarTo?: Product | number;
}

@EdmSchema.entityType('Order')
class Order extends Thing {
    orderDate?: Date;
    customer?: Person | number;
    orderedItem?: Product | number;
}

@EdmSchema.entityType()
class Person extends Thing {

}

describe('EdmSchema', () => {

    let context: TestContext;
    beforeAll(async () => {
        context = new TestContext();
        await context.authenticate();
    });

    it('should define entity set annotation', () => {
        const annotation = Product as unknown as {
            EntitySet: {
                name: string
            }
        }
        expect(annotation.EntitySet).toBeTruthy();
        expect(annotation.EntitySet.name).toEqual('Products');
    });

    it('should define entity type annotation', () => {
        const annotation = Order as unknown as {
            Entity: {
                name: string
            }
        }
        expect(annotation.Entity).toBeTruthy();
        expect(annotation.Entity.name).toEqual('Order');
    });

    it('should define entity type annotation from class', () => {
        const annotation = Person as unknown as {
            Entity: {
                name: string
            }
        }
        expect(annotation.Entity).toBeTruthy();
        expect(annotation.Entity.name).toEqual('Person');
    });

    it('should get items by using class', async () => {
        const items = await context.model(Product).where<Product>((x) => x.category === 'Laptops').getItems();
        expect(items).toBeTruthy();
        expect(items.length).toBeTruthy();
    });
});
