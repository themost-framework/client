import {EdmEntityType, EdmNavigationProperty, EdmProperty, EdmSchema} from '@themost/client';
import {BasicDataContext} from '@themost/client/common';

const EdmTypeMap = new Map([
    [
        'Edm.String', 'string',
    ],
    [
        'Edm.Guid', 'string',
    ],
    [
        'Edm.Duration', 'string',
    ],
    [
        'Edm.Int32', 'number',
    ],
    [
        'Edm.Int64', 'number',
    ],
    [
        'Edm.Decimal', 'number',
    ],
    [
        'Edm.Double', 'number',
    ],
    [
        'Edm.Single', 'number',
    ],
    [
        'Edm.Boolean', 'boolean',
    ],
    [
        'Edm.Date', 'Date',
    ],
    [
        'Edm.DateTime', 'Date',
    ],
    [
        'Edm.DateTimeOffset', 'Date',
    ]
]);

class TypeRenderer {

    protected context: BasicDataContext;
    protected schema: EdmSchema;

    /**
     * @param {string} host 
     */
    constructor(host: string) {
        this.context = new BasicDataContext(host);
    }

    /**
     * @param {import('@themost/client').EdmProperty} property 
     * @returns string
     */
    protected renderProperty(property: EdmProperty): string {
        if (EdmTypeMap.has(property.Type)) {
            return `${property.Name}?: ${EdmTypeMap.get(property.Type)};`
        }
        const found = this.schema.EntityType.find((t) => t.Name === property.Type);
        if (found) {
            return `${property.Name}?: (${property.Type} | any);`
        }
        return `${property.Name}?: any;`
    }

    protected renderNavigationProperty(property: EdmNavigationProperty): string {
        const isCollection = /^Collection\((.*)\)$/.exec(property.Type);
        let type = isCollection ? isCollection[1] : property.Type;
        if (EdmTypeMap.has(type)) {
            return `${property.Name}?: ${EdmTypeMap.get(type)};`
        }
        const found = this.schema.EntityType.find((t) => t.Name === type);
        const collectionType = isCollection ? '[]' : '';
        if (found) {
            return `${property.Name}?: (${type} | any)${collectionType};`
        }
        return `${property.Name}?: any${collectionType};`
    }

    /**
     * @param {import('@themost/client').EdmEntityType} entityType
     * @returns string
     */
    protected renderType(entityType: EdmEntityType) {
        const extendsInterface = entityType.BaseType ? ` extends ${entityType.BaseType} ` : '';
        const properties = entityType.Property.map((property) => {
            const { Name } = property;
            const Declaration = this.renderProperty(property);
            return {
                Name,
                Declaration
            }
        });
        properties.push(...entityType.NavigationProperty.map((property) => {
            const { Name } = property;
            const Declaration = this.renderNavigationProperty(property);
            return {
                Name,
                Declaration
            }
        }));
        const result = `
export interface ${entityType.Name} ${extendsInterface}{
${properties.sort(
    (a, b) => {
        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;
        return 0;
    }).map((property) => `\t${property.Declaration}`).join('\n')}
}`
        return result.replace(/(\n+)/g, '\n');
    }

    async render(type: string) {
        this.schema = await this.context.getMetadata();
        const entityType = this.schema.EntityType.find((t) => t.Name === type);
        return this.renderType(entityType)
    }

    async renderAny() {
        this.schema = await this.context.getMetadata();
        const typeDeclarations = this.schema.EntityType.sort(
            (a, b) => {
                if (a.Name < b.Name) return -1;
                if (a.Name > b.Name) return 1;
                return 0;
            }
        ).map((entityType) => this.renderType(entityType));
        return typeDeclarations.join('\n');
    }

}

export { TypeRenderer }
