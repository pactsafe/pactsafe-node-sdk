'use strict';

/**
 * Expose `Activity`.
 */
module.exports = exports = Activity;
module.exports.Activity = Activity;

/**
 * Module dependencies.
 */
const _ = require('lodash');
const assert = require('assert');
const bson = require('bson');
const type = require('component-type');
const clone = require('clone');
const request = require('superagent');
const utils = require('./utils');
const __pkg = require('../package.json');
const debug = require('debug')(__pkg.name + ':Activity');
const { EventEmitter } = require('events');

require('superagent-retry')(request);

/**
 * Initialize a new `Activity` client with your PactSafe Site's `access_id`,
 * an `options` object (optional) and a `parameters` object.
 *
 * @param {String} access_id
  * @param {Object} parameters (optional)
 *   @property {Boolean} test_mode (default: false)
 *   @property {Boolean} silent_error (default: false)
 * @param {Object} options (optional)
 *   @property {Number} flush_at (default: 20)
 *   @property {Number} flush_after (default: 5000)
 *   @property {String} host (default: 'https://pactsafe.io')
 */
function Activity(access_id, parameters, options) {
  if (!(this instanceof Activity)) return new Activity(access_id, parameters, options);
  assert(access_id, 'You must pass your PactSafe Site\'s Access ID.');
  parameters = parameters || {};
  options = options || {};

  this.access_id = access_id;
  this.options = this.defaultOptions(options);
  this.queue = [];
  this.groups = {};
  this.signers = {};

  this.parameters = {};
  this.parameters.site_id = this.access_id;
  this.set(parameters);
}

/**
 * Alternate method for instantiating
 * a new `Activity` client.
 *
 * @return {Activity}
 */
Activity.create = function(access_id, parameters, options) {
  return new Activity(access_id, parameters, options);
};

/**
 * Inherit from EventEmitter.
 */
Activity.prototype = Object.create(EventEmitter.prototype);
Activity.prototype.constructor = Activity;

/**
 * Return parameters object when converting to JSON.
 *
 * @return {Object}
 */
Activity.prototype.toJSON = function() {
  return this.parameters;
};

/**
 * Returns default options for an `Activity` client,
 * merged with `options`.
 *
 * @param {Object} options
 * @return {Object}
 * @api private
 */
Activity.prototype.defaultOptions = function(options) {
  options = _.defaults(options || {}, {
    host: 'https://pactsafe.io',
    flush_at: 20,
    flush_after: 10000,
    debug: false
  });
  options.flush_at = Math.max(options.flush_at, 1);
  return options;
};

/**
 * Send an agreed `action`.
 *
 * @param {String} signer_id
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Activity}
 */
Activity.prototype.agreed = function(signer_id, action, callback) {
  utils.validate(action);
  assert(signer_id, 'You must pass a "signer_id".');
  assert(action.render_id, 'Action must contain a "render_id".');
  action.signer_id = signer_id;
  this._send('agreed', action, callback);
  return this;
};

/**
 * Send a disagreed `action`.
 *
 * @param {String} signer_id
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Activity}
 */
Activity.prototype.disagreed = function(signer_id, action, callback) {
  utils.validate(action);
  assert(signer_id, 'You must pass a "signer_id".');
  assert(action.render_id, 'Action must contain a "render_id".');
  action.signer_id = signer_id;
  this._send('disagreed', action, callback);
  return this;
};

/**
 * Send an `action` for the specified event type.
 *
 * @param {String} event_type
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Activity}
 */
Activity.prototype.send = function(event_type, action, callback) {
  utils.validate(action);
  assert(event_type, 'You must pass an "event_type".');
  if (event_type == 'agreed') return this.agreed(action.signer_id, action, callback);
  else if (event_type == 'disagreed') return this.disagreed(action.signer_id, action, callback);
  this._send(event_type, action, callback);
  return this;
};

/**
 * Retrieve the accepted versions for the specified
 * contracts and signer_id.
 *
 * @param {String} signer_id
 * @param {Array} contracts (optional)
 * @param {Function} callback
 * @return {Activity}
 */
Activity.prototype.retrieve = function(signer_id, contracts, callback) {
  var self = this;
  callback = callback || _.noop;
  assert(signer_id, 'You must pass a "signer_id".');

  var data = self.build({
    event_type: 'retrieve',
    signer_id: signer_id,
    contracts: contracts
  });

  var req = request
    .get(self.options.host + '/retrieve')
    .retry(3)
    .query(data)
    .end(function(err, res) {
      err = err || utils.error(res);
      self.emit('retrieved', res.body);
      callback(err, res.body);
      debug('retrieved: %o', data);
    });

  return self;
};

/**
 * Retrieve a boolean for the specified contracts
 * and signer_id, indicating if the signer has
 * accepted the latest version.
 *
 * @param {String} signer_id
 * @param {Array} contracts
 * @param {Function} callback
 * @return {Activity}
 */
Activity.prototype.latest = function(signer_id, contracts, callback) {
  var self = this;
  callback = callback || _.noop;
  assert(signer_id, 'You must pass a "signer_id".');
  assert(contracts, 'You must pass a "contracts" array.');

  var data = self.build({
    event_type: 'latest',
    signer_id: signer_id,
    contracts: contracts
  });

  var req = request
    .get(self.options.host + '/latest')
    .retry(3)
    .query(data)
    .end(function(err, res) {
      err = err || utils.error(res);
      self.emit('latest', res.body);
      callback(err, res.body);
      debug('latest: %o', data);
    });

  return self;
};

/**
 * Load a group with dynamic render_data.
 *
 * @param {String} key
 * @param {Object} render_data
 * @param {Function} callback
 * @return {Activity}
 */
Activity.prototype.load = function(key, render_data, callback) {
  var self = this;
  callback = callback || _.noop;
  render_data = render_data || {};
  assert(key, 'You must pass a group "key".');
  utils.validate(render_data);

  var data = self.build({
    event_type: 'load',
    key: key,
    render_id: null,
    render_data: render_data
  });

  var req = request
    .post(self.options.host + '/load/json')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || utils.error(res);
      if (err) return callback(err);
      assert('object' === type(res.body), 'Load request did not return group object.');
      var group = new Group(self, res.body.key || key, res.body);
      self.emit('loaded', group);
      callback(err, group);
      debug('loaded: %o', data);
    });

  return self;
};

/**
 * Get `parameter` by name.
 *
 * @param {String} name
 * @return {Mixed}
 */
Activity.prototype.get = function(name) {
  assert(name, 'You must pass a parameter "name".');
  return this.parameters[name];
};

/**
 * Set `parameters`.
 *
 * @param {Object} parameters
 * @return {Activity}
 */
Activity.prototype.set = function(parameters) {
  parameters = parameters || {};
  utils.validate(parameters);
  this.parameters = _.extend({}, this.parameters, parameters, { site_id: this.access_id });
  return this;
};

/**
 * Build the `action` parameters for a send.
 *
 * @param {Object} overrides
 * @return {Object}
 */
Activity.prototype.build = function(overrides) {
  overrides = overrides || {};
  utils.validate(overrides);
  var parameters = _.extend({}, this.parameters, overrides),
    data = {},
    param;

  parameters.site_id = this.access_id;
  parameters.server_side = true;
  parameters.client_library = __pkg.name;
  parameters.client_version = __pkg.version;

  _.forOwn(parameters, function(v, k) {
    param = utils.parameterMap[k];
    if (param && param.code && 'undefined' !== type(v)) data[param.code] = v;
  });
  return data;
};

/**
 * Flush the current queue and call `callback(err, batch)`.
 *
 * @param {Function} callback (optional)
 * @return {Activity}
 */
Activity.prototype.flush = function(callback) {
  var self = this;
  callback = callback || _.noop;
  return callback(new Error('Not implemented.'));

  if (!self.queue.length) {
    setImmediate(callback);
    return self;
  }

  var items = self.queue.splice(0, self.options.flush_at),
    actions = items.map(function(i) { return i.action }),
    callbacks = items.map(function(i) { return i.callback });

  var data = {
    access_id: self.access_id,
    actions: actions,
    timestamp: new Date(),
    sent_at: new Date()
  };

  self.emit('flush', data);
  debug('flush: %o', data);

  var req = request
    .post(self.options.host + '/send/batch')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || utils.error(res);
      callbacks.push(callback);
      callbacks.forEach(function(callback) { callback(err, data) });
      self.emit('flushed', res);
      debug('flushed: %o', data);
    });

  return self;
};

/**
 * Send a single `action` to the PactSafe Activity API.
 *
 * @param {String} event_type
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Activity}
 * @api private
 */
Activity.prototype._send = function(event_type, action, callback) {
  var self = this;
  callback = callback || _.noop;
  utils.validate(action);

  action = clone(action);
  action.event_type = event_type;
  var data = self.build(action);

  self.emit('send', data);
  debug('send: %s: %o', event_type, action);

  var req = request
    .post(self.options.host + '/send')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || utils.error(res);
      self.emit('sent', res, res.body);
      callback(err, res.body);
      debug('sent: %s: %o', event_type, data);
    });

  return self;
};

/**
 * Add an `action` of type `event_type` to the queue and check whether it should be
 * flushed.
 *
 * @param {String} event_type
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Activity}
 * @api private
 */
Activity.prototype.enqueue = function(event_type, action, callback) {
  return this._send(event_type, action, callback);

  callback = callback || _.noop;
  utils.validate(action);

  action = clone(action);
  action.event_type = event_type;
  action.server_side = true;
  action.client_library = __pkg.name;
  action.client_version = __pkg.version;

  if (!action.timestamp) action.timestamp = new Date();
  if (!action.action_id) action.action_id = new bson.ObjectId().toJSON();

  debug('%s: %o', event_type, action);
  this.queue.push({
    action: action,
    callback: callback
  });

  if (this.queue.length >= this.options.flush_at) this.flush();
  if (this.timer) clearTimeout(this.timer);
  if (this.options.flush_after) this.timer = setTimeout(this.flush.bind(this), this.options.flush_after);
  return this;
};

/**
 * Expose subclasses.
 */
var Group = exports.Group = require('./group'),
  Signer = exports.Signer = require('./signer');
