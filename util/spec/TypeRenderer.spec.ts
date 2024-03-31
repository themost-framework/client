import {TypeRenderer} from '@themost/client/util';
import { serveApplication, getApplication } from '@themost/test';

describe("BasicClientDataContext", () => {

    beforeAll(async () => {
        const app = await getApplication();
        await serveApplication(app, 8080)
    });

    it("should render type", async () => {
        const renderer = new TypeRenderer('http://localhost:8080/api/');
        let typeDeclaration = await renderer.render('Thing');
        expect(typeDeclaration).toBeInstanceOf(String);
        typeDeclaration = await renderer.render('Workspace');
        expect(typeDeclaration).toBeInstanceOf(String);
    });

    it("should render any type", async () => {
        const renderer = new TypeRenderer('http://localhost:8080/api/');
        const typeDeclarations = await renderer.renderAny();
        expect(typeDeclarations).toBeInstanceOf(String);
    });



});
