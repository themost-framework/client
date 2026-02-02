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

    it('should get schema with default namespace', async () => {
        const schema = await context.getMetadata();
        expect(schema.Namespace).toEqual('App');
        const entityType = schema.EntityType.find((x) => x.Name === 'Product');
        expect(entityType).toBeTruthy();
        expect(entityType.BaseType).toEqual('Thing');
        expect(entityType.BaseTypeName.Name).toEqual('Thing');
        expect(entityType.BaseTypeName.QualifiedName).toEqual('App.Thing');
    });

    it('should parse type with namespace', () => {
        expect(EdmSchema.hasNameWithNamespace('App')).toBeFalsy();
        let actual1 = EdmSchema.hasNameWithNamespace('App.Thing');
        expect(actual1).toBeTruthy();
        expect(actual1.Name).toEqual('Thing');
        expect(actual1.QualifiedName).toEqual('App.Thing');
        expect(EdmSchema.hasNameWithNamespace('Thing')).toBeFalsy();
        expect(EdmSchema.hasNameWithNamespace('Edm.String')).toBeFalsy();
        expect(EdmSchema.hasNameWithNamespace('Collection(Edm.String)')).toBeFalsy();
        let actual = EdmSchema.hasNameWithNamespace('Collection(App.Thing)');
        expect(actual).toBeTruthy();
        expect(actual.Name).toEqual('Collection(Thing)');
        expect(actual.QualifiedName).toEqual('Collection(App.Thing)');
        expect(EdmSchema.hasNameWithNamespace('Collection(Thing)')).toBeFalsy();
    });

    it('should get entity set with default namespace', async () => {
        const schema = await context.getMetadata();
        expect(schema.Namespace).toEqual('App');
        const entitySet = schema.EntityContainer.EntitySet.find((x) => x.EntityType === 'Product');
        expect(entitySet).toBeTruthy();
        expect(entitySet.Name).toEqual('Products');
        expect(entitySet.EntityTypeName.Name).toEqual('Product');
        expect(entitySet.EntityTypeName.Namespace).toEqual('App');
        expect(entitySet.EntityTypeName.QualifiedName).toEqual('App.Product');
    });

    it('should get property with default namespace', async () => {
        const schema = await context.getMetadata();
        const entityType = schema.EntityType.find((x) => x.Name === 'Person');
        const property = entityType.NavigationProperty.find((x) => x.Name === 'workLocation');
        expect(property).toBeTruthy();
        expect(property.Type).toEqual('Place');
        expect(property.TypeName.Name).toEqual('Place');
        expect(property.TypeName.QualifiedName).toEqual('App.Place');
    });

    it('should get parameter with default namespace', async () => {
        const schema = await context.getMetadata();
        const func = schema.Function.find((x) => x.Name === 'Me');
        const parameter = func.Parameter.find((x) => x.Name === 'bindingParameter');
        expect(parameter).toBeTruthy();
        expect(parameter.Type).toEqual('Collection(Account)');
        expect(parameter.TypeName.Name).toEqual('Collection(Account)');
        expect(parameter.TypeName.QualifiedName).toEqual('Collection(App.Account)');
        expect(func.ReturnType.TypeName).toBeTruthy();
        expect(func.ReturnType.Type).toEqual('User')
        expect(func.ReturnType.TypeName.Name).toEqual('User');
        expect(func.ReturnType.TypeName.QualifiedName).toEqual('App.User');
    });

    it('should get collection property with default namespace', async () => {
        const schema = await context.getMetadata();
        const entityType = schema.EntityType.find((x) => x.Name === 'Person');
        const property = entityType.NavigationProperty.find((x) => x.Name === 'colleagues');
        expect(property).toBeTruthy();
        expect(property.Type).toEqual('Collection(Person)');
        expect(property.TypeName.Name).toEqual('Collection(Person)');
        expect(property.TypeName.QualifiedName).toEqual('Collection(App.Person)');
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
