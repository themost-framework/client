// karma-test-api-server.js
const {getApplication, serveApplication, getServerAddress} = require('@themost/test');
// noinspection NpmUsedModulesInstalled
const {ODataModelBuilder} = require('@themost/data');
const { URL } = require('url');
function serveKarmaTestApiServer(proxies) {
    const app = getApplication();
    /**
     * @type {import('@themost/express').ExpressDataApplication}
     */
    const service = app.get('ExpressDataApplication');
    service.getConfiguration().setSourceAt('settings/builder/defaultNamespace', 'App');
    /**
     * @type {import('@themost/data').ODataModelBuilder}
     */
    const builder = service.getService(ODataModelBuilder);
    builder.clean(true);
    return serveApplication(app).then( function(liveServer) {
        const serverAddress = getServerAddress(liveServer);
        Object.assign(proxies, {
            '/api/': new URL('/api/', serverAddress).toString(),
            '/auth/': new URL('/auth/', serverAddress).toString()
        });
    });
}

serveKarmaTestApiServer.$inject = ['config.proxies'];

module.exports =  {
    'framework:api': [
        'factory',
        serveKarmaTestApiServer
    ]
};