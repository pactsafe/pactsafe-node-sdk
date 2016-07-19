
function API() {}

API.printMsg = function() {
    console.log("TEST");
};

API.load = require('./load');

module.exports = API;