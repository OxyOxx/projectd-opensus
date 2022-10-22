const http = require('http');
const https = require('https');
const querystring = require('querystring');

const combineOptions = options => Object.assign({
    detailed: false, encoding: 'utf8',
    headers: {}, stream: false,
    validateStatus:
        status => status >= 200 && status < 300
}, options)

const parseBody = data => {
    if (data.headers['content-type']?.includes('application/json')) 
        return JSON.parse(data.body);
    else return data.body.toString();
};

module.exports = function fetch(url, options = {}) {
    return new Promise(async (resolve, reject) => {
        options = combineOptions(options);
        if (options?.query !== undefined) url += `?${querystring.stringify(options.query)}`;

        if (options.json || options.body) {
            if (options.json) {
                options.headers['content-type'] = 'application/json';
                options.sendData = (typeof options.json == 'object' ? 
                    JSON.stringify(options.json) : options.json);
            } else if (options.body) {
                options.headers['content-type'] = 'application/x-www-form-urlencoded';
                options.sendData = (typeof options.body == 'object' ? 
                    querystring.stringify(options.body) : options.body);
            };
        };

        const req = (url.startsWith('https') ?
            https.request : http.request)(url, options, async (res) => {

                if (options.validateStatus(res.statusCode) == false) return reject(new Error(`Request to ${url} failed with code ${res.statusCode}`));

                if (options.stream) return resolve(res);

                const chunks = [];

                res.on('data', chunk =>
                    chunks.push(chunk));

                res.on('end', () => {
                    const data = {
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        headers: res.headers,
                        result: res,
                        request: res.req,
                        body: Buffer.concat(chunks)
                    };

                    if (options.encoding) {
                        data.body = data.body.toString(options.encoding);
                        data.body = parseBody(data);
                    };

                    resolve(options.detailed ? data : data.body);
                });

            }).on('error', error => reject(error));

        if (options.sendData)
            req.write(options.sendData);
        req.end();

    });
};