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


/**
 * Initialize a new `Group` with your PactSafe Group's `key`,
 * an `options` object (optional) and a `parameters` object.
 *
 * @param {String} key
 * @param {Activity} site
 * @param {Object} parameters (optional)
 *   @property {Boolean} test_mode (default: false)
 */

function Group(key, site, parameters) {
  if (!(this instanceof Group)) return new Group(key, options, parameters);
  assert(key, 'You must pass a "key".');
  parameters = parameters || {};
  
  this.key = key;
  this.site = site;
  
  this.parameters = {};
  this.parameters.key = this.key;
  this.set(parameters);
}

/**
 * Return parameters object when converting to JSON.
 *
 * @return {Object}
 */

Group.prototype.toJSON = function() {
  return this.parameters;
};

/**
 * Set parameters.
 *
 * @param {Object} parameters
 * @return {Group}
 */

Group.prototype.set = function(parameters) {
  this.parameters.group = parameters.group;
  this.parameters.type = parameters.type;
  this.parameters.contracts = parameters.contracts;
  this.parameters.versions = parameters.versions;
  this.parameters.revisions = parameters.revisions;
  this.parameters.contract_html = parameters.contract_html;
  this.parameters.confirmation_email = parameters.confirmation_email;
  this.parameters.render_id = parameters.render_id;
  this.parameters.render_data = parameters.render_data;
  return this;
};

/**
 * Send an agreed `action`.
 *
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Group}
 */

Group.prototype.agreed = function(action, callback) {
  validate(action);
  var parameters = extend({}, this.parameters, action);
  this.site.send('agreed', parameters, callback);
  return this;
};

/**
 * Send an `action` for the specified event type.
 *
 * @param {String} event_type
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Group}
 */

Group.prototype.send = function(event_type, action, callback) {
  validate(action);
  var parameters = extend({}, this.parameters, action);
  this.site.send(event_type, parameters, callback);
  return this;
};

/**
 * Retrieve the accepted versions for the group's
 * contracts and the specified signer_id.
 *
 * @param {String} signer_id
 * @param {Function} callback
 * @return {Group}
 */

Group.prototype.retrieve = function(signer_id, callback) {
  callback = callback || noop;
  this.site.retrieve(signer_id, this.parameters.contracts, callback);
  return this;
};

/**
 * Retrieve a boolean for the group's contracts
 * and specified signer_id, indicating if the
 * signer has accepted the latest version.
 *
 * @param {String} signer_id
 * @param {Function} callback
 * @return {Group}
 */

Group.prototype.latest = function(signer_id, callback) {
  callback = callback || noop;
  this.site.latest(signer_id, this.parameters.contracts, callback);
  return this;
};

/**
 * Load a group with dynamic render_data.
 *
 * @param {Object} render_data (optional)
 * @param {Function} callback
 * @return {Group}
 */

Group.prototype.reload = function(render_data, callback) {
  var self = this;
  callback = callback || noop;
  render_data = render_data || {};
  validate(render_data);
  
  var data = this.site.build({
    event_type: 'load',
    group_key: this.parameters.key,
    render_data: render_data
  });
  
  var req = request
    .post(this.site.host + '/load/json')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || error(res);
      if (err) return callback(err);
      self.set(res.body);
      callback(err, res.body);
      debug('reload: %o', data);
    });
  
  return this;
};

/**
 * Load a group's HTML with dynamic render_data.
 *
 * @param {Object} render_data (optional)
 * @param {Function} callback
 * @return {Group}
 */

Group.prototype.render = function(render_data, callback) {
  var self = this;
  callback = callback || noop;
  render_data = render_data || self.parameters.render_data;
  validate(render_data);
  
  var data = this.site.build({
    event_type: 'render',
    group_key: self.parameters.key,
    render_data: render_data
  });
  
  var req = request
    .post(this.site.host + '/load/html')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || error(res);
      if (err) return callback(err);
      self.parameters.render_data = render_data;
      self.parameters.contract_html = res.text;
      callback(err, res.text);
      debug('render: %o', data);
    });
  
  return this;
};

/*!
 * Module exports.
 */

module.exports = exports = Group;

/**
 * Validation rules.
 */

var rules = {
  signer_id: 'string',
  category: 'string',
  context: 'object',
  event: 'string',
  groupId: ['string', 'number'],
  integrations: 'object',
  name: 'string',
  previousId: ['string', 'number'],
  timestamp: 'date',
  userId: ['string', 'number']
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
