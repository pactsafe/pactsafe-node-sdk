var request = require('request');
function signer() {}

var testing = true;
if (testing) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

var setOptions = function (route, params) {
    var options = {
        baseUrl: "https://response.pactsafe.dev:3002",
        url: route,
        method: "POST",
        qs: {
            v: '1',
            _v: 'ps1',
            uid: '576314f9522d407105d7caa4',
            sid: '0207a846-d9bf-4b13-8430-1344e86ff7b1',
            et: 'retrieve',
            sig: 'michael%40pactsafe.com',
            cid: '2',
            tm: '0',
            dyn: '1',
            pat: 'Login%20-%20PactSafe',
            pau: 'https%3A%2F%2Fapp.pactsafe.dev%2Flogin',
            pad: 'app.pactsafe.dev%3A3000',
            pap: '%2Flogin',
            pae: 'UTF-8',
            ref: 'https%3A%2F%2Fapp.pactsafe.dev%3A3000%2Fdashboard',
            btz: '4',
            bl: 'en-us',
            bje: '0',
            bfv: '22.0%20r0',
            os: 'MacOS',
            env: 'desktop',
            scd: '24-bit',
            res: '1440x900',
            dim: '625x717',
            _s: '3',
            nc: '548951298'
        }

    };
    console.log(options);
    return options;
};

signer.retrieveActions = function (params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    var options = setOptions("/retrieve", params);
    request(options, callback);
};

module.exports = signer;

