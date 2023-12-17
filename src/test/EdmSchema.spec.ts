import { EdmSchema } from '@themost/client';

@EdmSchema.entitySet('Products')
class Product {

}

@EdmSchema.entityType('Order')
class Order {

}

@EdmSchema.entityType()
class Person {

}

describe('EdmSchema', () => {
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
});