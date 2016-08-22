/*!
 * Module dependencies.
 */

var assert = require('assert');
var clone = require('clone');
var debug = require('debug')('pactsafe-activity');
var noop = function(){};
var request = require('superagent');
require('superagent-retry')(request);
var type = require('component-type');
var join = require('join-component');
var uid = require('crypto-token');
var version = require('../package.json').version;
var _ = require('lodash');
var extend = require('lodash').extend;

var Group = require('./group');

global.setImmediate = global.setImmediate || process.nextTick.bind(process);

/*
var pactsafe = require('pactsafe-activity');
var activity = new Activity('4163db85-2a9d-4bba-b74e-ad12375d7a42');

activity.agreed({
  signer_id: 'adam@pactsafe.com',
  contracts: [ 1, 2 ],
  versions: [ '57acb5b490cb50b4220f196b', '57acb71390cb50b4220f196c' ]
}, function(err, reply) {
  
});
*/

var parameterMap = {
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

var parameterMapInverse = {
  sid: 'site_id',
  et: 'event_type',
  sig: 'signer_id',
  uid: 'uuid',
  rev: 'revision',
  vid: 'version',
  cid: 'contract',
  gid: 'group',
  gkey: 'group_key',
  srid: 'request',
  xt: 'external',
  xtu: 'external_url',
  cus: 'custom_data',
  pat: 'page_title',
  pau: 'page_url',
  //pad: 'page_domain',
  //pap: 'page_path',
  //paq: 'page_query',
  //hn: 'hostname',
  ref: 'referrer',
  //btz: 'browser_timezone',
  //bl: 'browser_locale',
  bua: 'user_agent',
  os: 'operating_system',
  env: 'environment',
  //scd: 'screen_color_depth',
  //res: 'screen_resolution',
  nc: 'nonce',
  //ts: 'timestamp',
  //_s: 'send_count',
  tm: 'test_mode',
  rdid: 'render_id',
  rnd: 'render_data',
  dyn: 'dynamic',
  _ct: 'certification_token',
  cnf: 'confirmation_email'
};

/**
 * Initialize a new `Activity` client with your PactSafe Site's `access_id`,
 * an `options` object (optional) and a `parameters` object.
 *
 * @param {String} access_id
 * @param {Object} options (optional)
 *   @property {Number} flush_at (default: 20)
 *   @property {Number} flush_after (default: 5000)
 *   @property {String} host (default: 'https://pactsafe.io')
 * @param {Object} parameters (optional)
 *   @property {Boolean} test_mode (default: false)
 *   @property {Boolean} certification_token (default: false)
 */

function Activity(access_id, options, parameters) {
  if (!(this instanceof Activity)) return new Activity(access_id, options, parameters);
  assert(access_id, 'You must pass your PactSafe Site\'s Access ID.');
  options = options || {};
  parameters = parameters || {};
  this.queue = [];
  this.groups = {};
  this.access_id = access_id;
  
  this.host = options.host || 'https://pactsafe.io';
  this.flush_at = Math.max(options.flush_at, 1) || 20;
  this.flush_after = options.flush_after || 10000;
  this.debug = options.debug || false;
  this.log_only = options.log_only || false;
  
  this.parameters = {};
  this.parameters.site_id = this.access_id;
  this.parameters.test_mode = parameters.test_mode;
  this.parameters.certification_token = parameters.certification_token;
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
  assert(action.contracts, 'You must pass "contracts".');
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
  assert(action.contracts, 'You must pass "contracts".');
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
  callback = callback || noop;
  assert(signer_id, 'You must pass a "signer_id".');
  assert(contracts, 'You must pass "contracts".');
  
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
  callback = callback || noop;
  assert(signer_id, 'You must pass a "signer_id".');
  assert(contracts, 'You must pass "contracts".');
  
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

Activity.prototype.load = function(group_key, render_data, callback) {
  var self = this;
  callback = callback || noop;
  render_data = render_data || {};
  assert(group_key, 'You must pass a "group_key".');
  validate(render_data);
  
  var data = this.build({
    event_type: 'load',
    group_key: group_key,
    render_data: render_data
  });
  
  var req = request
    .post(this.host + '/load/json')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || error(res);
      if (err) return callback(err);
      if (!(self.groups[res.body.key] instanceof Group)) self.groups[res.body.key] = new Group(res.body.key, self, res.body);
      else self.groups[res.body.key].set(res.body);
      callback(err, self.groups[res.body.key]);
      debug('load: %o', data);
    });
  
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
  
  var parameters = extend(this.parameters, overrides),
    params = {},
    short_code;
    
  _.forOwn(parameters, function(v, k) {
    short_code = parameterMap[k];
    if (short_code && typeof v !== 'undefined') params[short_code] = v;
  });
  
  return params;
};

/**
 * Flush the current queue and callback `callback(err, batch)`.
 *
 * @param {Function} callback (optional)
 * @return {Activity}
 */

Activity.prototype.flush = function(callback) {
  callback = callback || noop;
  if (!this.queue.length) return setImmediate(callback);

  var items = this.queue.splice(0, this.flush_at);
  var callbacks = items.map(function(i) { return i.callback });
  var batch = items.map(function(i) { return i.action });

  var data = {
    batch: batch,
    timestamp: new Date(),
    sent_at: new Date()
  };

  debug('flush: %o', data);

  var req = request
    .post(this.host + '/batch')
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
  callback = callback || noop;
  action = clone(action);
  action.event_type = event_type;
  action.context = extend(action.context || {}, { library: { name: 'pactsafe-activity', version: version }});
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

/*!
 * Module exports.
 */

module.exports = exports = Activity;

/**
 * Validation rules.
 */

var rules = {
  signer_id: 'string',
  context: 'object',
  event_type: 'string',
  group: ['string', 'number'],
  name: 'string',
  timestamp: 'date'
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
    assert(exp.some(function(e){ return type(val) === e; }), '"' + key + '" must be ' + a + ' ' + join(exp, 'or') + '.');
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
  var msg = body.error && body.error.message
    || res.status + ' ' + res.text;
  return new Error(msg);
}
