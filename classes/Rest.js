const router = require('../utils/route.js');
const https = require('https');

class REST {
    constructor(url, defaultOptions = {}) {
        this.path = url;
        this.default = defaultOptions;
        if (this.path.startsWith('https')) {
            this.agent = new https.Agent({
                keepAlive: true
            });
            this.default.agent = this.agent;
        }
    }

    get api() {
        return router(this.path, this.default);
    }
}

module.exports = REST;
