var request = require('request');
function beacon() {}

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
            v: '1',
            _v: 'ps1',
            uid: '576314f9522d407105d7caa4',
            sid: '0207a846-d9bf-4b13-8430-1344e86ff7b1',
            et: 'displayed',
            sig: 'michael%40pactsafe.com',
            rev: '',
            vid: '576942eeaed1fa6e06104411',
            cid: '2',
            gid: '3',
            cnf: '0',
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
            _s: '4',
            nc: '806920911'
        }
    };
    console.log(options);
    return options;
};

beacon.serveBeacon = function (params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = {};
    }
    var options = setOptions("/send", params);
    request(options, callback);
};

module.exports = beacon;

