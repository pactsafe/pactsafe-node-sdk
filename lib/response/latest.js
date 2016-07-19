var request = require('request');
function latest() {}

var testing = true;
if (testing) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

var setOptions = function (route, params) {
    var options = {
        baseUrl: "https://response.pactsafe.dev:3002",
        url: route,
        method: "GET",
        qs: {
            v: params.api_version || '1',
            _v: params.library_version || 'ps1',
            uid: '576314f9522d407105d7caa4',
            sid: '0207a846-d9bf-4b13-8430-1344e86ff7b1',
            sig: 'michael%40pactsafe.com',
            tm: params.test_mode || '0',
            dyn: params.dynamic || '0',
            pat: 'Login%20to%20PactSafe',
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
            dim: '871x717',
            _s: '1',
            gkey: 'ps-login-clickwrap',
            nc: '268325509'
        }
    };
    console.log(options);
    return options;
};

latest.compareLatestVersions = function (params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    var options = setOptions("/latest", params);
    request(options, callback);
};

module.exports = latest;

