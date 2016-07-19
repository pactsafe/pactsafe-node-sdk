
function API() {}

API.printMsg = function() {
    console.log("TEST");
};

API.beacon = require('./beacon');
API.latest = require('./latest');
API.load = require('./load');
API.signer = require('./signer');

module.exports = API;