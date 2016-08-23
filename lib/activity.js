/**
 * Module dependencies.
 */
var __library_name = require('../package.json').name,
  __library_version = require('../package.json').version;

var assert = require('assert'),
  debug = require('debug')(__library_name),
  bson = require('bson'),
  type = require('component-type'),
  clone = require('clone'),
  join = require('join-component'),
  uid = require('crypto-token'),
  _ = require('lodash'),
  request = require('superagent');
require('superagent-retry')(request);

/**
 * Global helpers.
 */
global.setImmediate = global.setImmediate || process.nextTick.bind(process);

/**
 * Map of full parameter names to
 * their query string codes.
 *
 * Only the parameters listed in
 * this map will be included in
 * the `send` payload.
 */
var _parameterMap = {
  access_id: 'sid',
  site_id: 'sid',
  event_type: 'et',
  signer_id: 'sig',
  uuid: 'uid',
  revision: 'rev',
  revisions: 'rev',
  version: 'vid',
  versions: 'vid',
  contract: 'cid',
  contracts: 'cid',
  group: 'gid',
  group_key: 'gkey',
  key: 'gkey',
  request: 'srid',
  external: 'xt',
  external_url: 'xtu',
  custom_data: 'cus',
  page_title: 'pat',
  page_url: 'pau',
  referrer: 'ref',
  user_agent: 'bua',
  operating_system: 'os',
  environment: 'env',
  nonce: 'nc',
  test_mode: 'tm',
  render_id: 'rdid',
  render_data: 'rnd',
  dynamic: 'dyn',
  certification_token: '_ct',
  confirmation_email: 'cnf'
};

/**
 * Validation rules.
 */
var rules = {
  signer_id: 'string',
  event_type: 'string',
  group: ['string', 'number']
};

/**
 * Initialize a new `Activity` client with your PactSafe Site's `access_id`,
 * an `options` object (optional) and a `parameters` object.
 *
 * @param {String} access_id
  * @param {Object} parameters (optional)
 *   @property {Boolean} test_mode (default: false)
 *   @property {Boolean} certification_token (default: false)
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
  this.queue = [];
  this.groups = {};
  this.signers = {};
  
  this.host = options.host || 'https://pactsafe.io';
  this.flush_at = Math.max(options.flush_at, 1) || 20;
  this.flush_after = options.flush_after || 10000;
  this.debug = options.debug || false;
  this.log_only = options.log_only || false;
  
  this.parameters = {};
  this.parameters.site_id = this.access_id;
  this.set(parameters);
}

/**
 * Return parameters object when converting to JSON.
 *
 * @return {Object}
 */
Activity.prototype.toJSON = function() {
  return this.parameters;
};

/**
 * Send an agreed `action`.
 *
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Activity}
 */
Activity.prototype.agreed = function(action, callback) {
  validate(action);
  assert(action.signer_id, 'You must pass a "signer_id".');
  assert(action.contracts, 'You must pass a "contracts" array.');
  this.enqueue('agreed', action, callback);
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
  validate(action);
  assert(event_type, 'You must pass an "event_type".');
  assert(action.signer_id, 'You must pass a "signer_id".');
  assert(action.contracts, 'You must pass a "contracts" array.');
  this.enqueue(event_type, action, callback);
  return this;
};

/**
 * Retrieve the accepted versions for the specified
 * contracts and signer_id.
 *
 * @param {String} signer_id
 * @param {Array} contracts
 * @param {Function} callback
 * @return {Activity}
 */
Activity.prototype.retrieve = function(signer_id, contracts, callback) {
  callback = callback || _.noop;
  assert(signer_id, 'You must pass a "signer_id".');
  assert(contracts, 'You must pass a "contracts" array.');
  
  var data = this.build({
    event_type: 'retrieve',
    signer_id: signer_id,
    contracts: contracts
  });
  
  var req = request
    .get(this.host + '/retrieve')
    .retry(3)
    .query(data)
    .end(function(err, res) {
      err = err || error(res);
      callback(err, res.body);
      debug('retrieved: %o', data);
    });
  
  return this;
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
  callback = callback || _.noop;
  assert(signer_id, 'You must pass a "signer_id".');
  assert(contracts, 'You must pass a "contracts" array.');
  
  var data = this.build({
    event_type: 'latest',
    signer_id: signer_id,
    contracts: contracts
  });
  
  var req = request
    .get(this.host + '/latest')
    .retry(3)
    .query(data)
    .end(function(err, res) {
      err = err || error(res);
      callback(err, res.body);
      debug('latest: %o', data);
    });
  
  return this;
};

/**
 * Load a group with dynamic render_data.
 *
 * @param {String} group_key
 * @param {Object} render_data
 * @param {Function} callback
 * @return {Activity}
 */
Activity.prototype.load = function(key, render_data, callback) {
  var self = this;
  callback = callback || _.noop;
  render_data = render_data || self.parameters.render_data || {};
  assert(key, 'You must pass a group "key".');
  validate(render_data);
  
  var data = self.build({
    event_type: 'load',
    key: key,
    render_data: render_data
  });
  
  var req = request
    .post(self.host + '/load/json')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || error(res);
      if (err) return callback(err);
      assert('object' == type(res.body), 'Load request did not return group object.');
      var group = self.setGroup.call(self, res.body.key || key, res.body);
      callback(err, group);
      debug('load: %o', data);
    });
  
  return this;
};

/**
 * Get cached group by `key`.
 *
 * @param {String} key
 * @return {Group}
 */
Activity.prototype.getGroup = function(key) {
  assert(key, 'You must pass a group "key".');
  return this.groups[key];
};

/**
 * Set new or updating existing cached
 * group by `key`.
 *
 * @param {String} key
 * @param {Object} parameters
 * @return {Group}
 */
Activity.prototype.setGroup = function(key, parameters) {
  parameters = parameters || {};
  assert(key, 'You must pass a group "key".');
  validate(parameters);
  
  var group = this.getGroup(key);
  if (!group || !(group instanceof Group)) group = new Group(this, key, parameters);
  else group.set(parameters);
  this.groups[key] = group;
  return group;
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
  validate(parameters);
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
  validate(overrides);
  var parameters = _.extend({}, this.parameters, overrides),
    data = {},
    code;

  _.forOwn(parameters, function(v, k) {
    code = _parameterMap[k];
    if (code && 'undefined' != type(v)) data[code] = v;
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
  callback = callback || _.noop;
  if (!this.queue.length) return setImmediate(callback);

  var items = this.queue.splice(0, this.flush_at),
    actions = items.map(function(i) { return i.action }),
    callbacks = items.map(function(i) { return i.callback });

  var data = {
    access_id: this.access_id,
    actions: actions,
    timestamp: new Date(),
    sent_at: new Date(),
    library: __library_name,
    library_version: __library_version
  };

  debug('flush: %o', data);

  var req = request
    .post(this.host + '/send/batch')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || error(res);
      callbacks.push(callback);
      callbacks.forEach(function(callback) { callback(err, data) });
      debug('flushed: %o', data);
    });
};

/**
 * Add an `action` of type `event_type` to the queue and check whether it should be
 * flushed.
 *
 * @param {String} event_type
 * @param {Object} action
 * @param {Function} callback (optional)
 * @api private
 */
Activity.prototype.enqueue = function(event_type, action, callback) {
  callback = callback || _.noop;
  validate(action);
  
  action = clone(action);
  action.event_type = event_type;
  action.library = __library_name;
  action.library_version = __library_version;
  
  if (!action.timestamp) action.timestamp = new Date();
  if (!action.action_id) action.action_id = 'node-' + uid(32);

  debug('%s: %o', event_type, action);
  this.queue.push({
    action: action,
    callback: callback
  });

  if (this.queue.length >= this.flush_at) this.flush();
  if (this.timer) clearTimeout(this.timer);
  if (this.flush_after) this.timer = setTimeout(this.flush.bind(this), this.flush_after);
};

/**
 * Validate an options `obj`.
 *
 * @param {Object} obj
 */
function validate(obj) {
  assert('object' == type(obj), 'You must pass an action object.');
  for (var key in rules) {
    var val = obj[key];
    if (!val) continue;
    var exp = rules[key];
    exp = ('array' === type(exp) ? exp : [exp]);
    var a = 'object' == exp ? 'an' : 'a';
    assert(exp.some(function(e) { return type(val) === e; }), '"' + key + '" must be ' + a + ' ' + join(exp, 'or') + '.');
  }
};

/**
 * Get an error from a `res`.
 *
 * @param {Object} res
 * @return {String}
 */
function error(res) {
  if (!res.error) return;
  var body = res.body;
  var msg = body.error && (body.error.message || res.status) + ' ' + res.text;
  return new Error(msg);
}

/**
 * Expose.
 */
module.exports = exports = Activity;
module.exports.Activity = Activity;

/**
 * Module classes.
 */
var Group = require('./group'),
  Signer = require('./signer');
