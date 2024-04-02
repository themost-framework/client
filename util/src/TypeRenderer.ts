import {EdmEntityType, EdmNavigationProperty, EdmProperty, EdmSchema} from '@themost/client';
import {BasicDataContext} from '@themost/client/common';
import { readFile } from 'fs';

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

const Space = ' ';
const OpeningBracket = '{';
const ClosingBracket = '}';
const NewLine = '\n';
const Tab = '\t';

class TypeRenderer {

    protected context: BasicDataContext;
    protected schema: EdmSchema;

    constructor(host?: string, private options?: {
        classes: boolean
    }) {
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
        let result = '';
        if (this.options && this.options.classes) {
            // find entity set and define annotation
            const entitySet = this.schema.EntityContainer.EntitySet.find((s) => s.EntityType === entityType.Name);
            if (entitySet) {
                result += `@EdmSchema.entitySet('${entitySet.Name}')`;
                result += NewLine;
            }
        }
        result += 'export';
        result += Space;
        result += this.options && this.options.classes ? 'class' : 'interface';
        result += Space;
        result += entityType.Name;
        result += Space;
        result += entityType.BaseType ? `extends ${entityType.BaseType}` : '';
        result += Space;
        result += OpeningBracket;
        result += NewLine;
        result += properties.sort((a, b) => {
                if (a.Name < b.Name) return -1;
                if (a.Name > b.Name) return 1;
                return 0;
            }).map((property) => Tab + `${property.Declaration}`).join(NewLine);
        result += NewLine;
        result += ClosingBracket;
        return result.replace(/(\n+)/g, '\n');
    }

    async render(type: string) {
        if (this.schema == null) {
            this.schema = await this.getSchema();
        }
        const entityType = this.schema.EntityType.find((t) => t.Name === type);
        return this.renderType(entityType)
    }

    protected getSchema(): Promise<EdmSchema> {
        return this.context.getMetadata();
    }

    async renderAny() {
        if (this.schema == null) {
            this.schema = await this.getSchema();
        }
        const typeDeclarations = this.schema.EntityType.sort(
            (a, b) => {
                if (a.Name < b.Name) return -1;
                if (a.Name > b.Name) return 1;
                return 0;
            }
        ).map((entityType) => this.renderType(entityType));
        let result = '';
        if (this.options && this.options.classes) {
            result += 'import { EdmSchema } from \'@themost/client\';';
            result += NewLine;
            result += NewLine;
        }
        result += typeDeclarations.join(NewLine + NewLine);
        return result;
    }
}

class FileSchemaRenderer extends TypeRenderer {
    constructor(private file: string) {
        super();
    }

    protected getSchema(): Promise<EdmSchema> {
        return new Promise((resolve, reject) => {
            void readFile(this.file, 'utf8', (err, data) => {
               if (err) {
                   return reject(err);
               }
               try {
                   const schema = EdmSchema.loadXML(data);
                   return resolve(schema);
               } catch (e) {
                   return reject(e);
               }
            });
        });
    }

}

export {
    TypeRenderer,
    FileSchemaRenderer
}
