'use strict';

/**
 * Global helpers.
 */
global.setImmediate = global.setImmediate || process.nextTick.bind(process);

/**
 * Expose main `Activity` class.
 */
module.exports = exports = require('./activity');