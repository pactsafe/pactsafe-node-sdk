/**
 * Load all module classes.
 */
var classes = [
  './group',
  './signer'
];
classes.forEach(function(path) {
	var module = require(path);
	for (var i in module) {
		exports[i] = module[i];
  }
});

/**
 * Load main Activity class.
 */
module.exports = exports = require('./activity');
