var response = require('./response/response');
module.exports.response = response;

module.exports.printMsg = function() {
    console.log("This is a message from the demo package");
};

// API.response.printMsg = function() {
//     console.log("TEST");
// };