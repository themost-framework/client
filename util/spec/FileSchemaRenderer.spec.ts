import {FileSchemaRenderer, TypeRenderer} from '@themost/client/util';
import { resolve } from 'path';

describe("FileSchemaRenderer(", () => {

    it("should render type", async () => {
        const renderer = new FileSchemaRenderer(resolve(__dirname, 'metadata.xml'));
        let typeDeclaration = await renderer.render('Thing');
        expect(typeDeclaration).toBeInstanceOf(String);
        typeDeclaration = await renderer.render('Workspace');
        expect(typeDeclaration).toBeInstanceOf(String);
    });

    it("should render any type", async () => {
        const renderer = new FileSchemaRenderer(resolve(__dirname, 'metadata.xml'));
        const typeDeclarations = await renderer.renderAny();
        expect(typeDeclarations).toBeInstanceOf(String);
    });



});
