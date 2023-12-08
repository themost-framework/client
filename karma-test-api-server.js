// karma-test-api-server.js
const {getApplication, serveApplication, getServerAddress} = require('@themost/test');
const { URL } = require('url');
function serveKarmaTestApiServer(proxies) {
    const app = getApplication();
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