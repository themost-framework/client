const { EdmEntityType, EdmProperty } = require('@themost/client');
const { BasicDataContext } = require('@themost/client/common');

class TypeRenderer {

    /**
     * @type {BasicDataContext}
     */
    context;

    /**
     * @param {string} host 
     */
    constructor(host) {
        this.context = new BasicDataContext(host);
    }

    /**
     * @param {import('@themost/client').EdmProperty} property 
     * @returns string
     */
    renderProperty(property) {
        return `${property.Name}: ${property.Type};`
    }

    /**
     * @param {import('@themost/client').EdmEntityType} property 
     * @returns string
     */
    render(entityType) {
        return `
export interface ${entityType.Name} {
    ${entityType.Property.forEach((property) => {
        return `\t${this.renderProperty(property)}\n`
    })}
}`
    }
}

module.exports = { TypeRenderer }
