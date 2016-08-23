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
 * Initialize a new `Group` with the parent `Activity` client,
 * your PactSafe Group's `key`, and a `parameters` object.
 *
 * @param {Activity} client
 * @param {String} key
 * @param {Object} parameters (optional)
 *   @property {Boolean} test_mode (default: false)
 */
function Group(client, key, parameters) {
  if (!(this instanceof Group)) return new Group(client, key, parameters);
  assert(client && (client instanceof Activity), 'You must pass an "Activity" client.');
  assert(key, 'You must pass a "key".');
  parameters = parameters || {};
  
  this.client = client;
  this.key = key;
  
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
  parameters = parameters || {};
  validate(parameters);
  this.parameters = _.extend({}, this.parameters, parameters, { key: this.key });
/*
  this.parameters.group = parameters.group;
  this.parameters.type = parameters.type;
  this.parameters.contracts = parameters.contracts;
  this.parameters.versions = parameters.versions;
  this.parameters.revisions = parameters.revisions;
  this.parameters.contract_html = parameters.contract_html;
  this.parameters.confirmation_email = parameters.confirmation_email;
  this.parameters.render_id = parameters.render_id;
  this.parameters.render_data = parameters.render_data;
*/
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
  var data = _.extend({}, this.parameters, action);
  this.client.agreed(data, callback);
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
  var data = _.extend({}, this.parameters, action);
  this.client.send(event_type, data, callback);
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
  this.client.retrieve(signer_id, this.parameters.contracts, callback);
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
  this.client.latest(signer_id, this.parameters.contracts, callback);
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
  render_data = render_data || self.parameters.render_data;
  validate(render_data);
  
  var data = self.client.build({
    event_type: 'load',
    key: self.parameters.key,
    render_data: render_data
  });
  
  var req = request
    .post(self.client.host + '/load/json')
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
  
  var data = self.client.build({
    event_type: 'render',
    key: self.parameters.key,
    render_data: render_data
  });
  
  var req = request
    .post(self.client.host + '/load/html')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || error(res);
      if (err) return callback(err);
      callback(err, res.text);
      debug('render: %o', data);
    });
  
  return this;
};

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
    assert(exp.some(function(e) { return type(val) === e }), '"' + key + '" must be ' + a + ' ' + join(exp, 'or') + '.');
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
module.exports = Group;
module.exports.Group = Group;

/**
 * Module classes.
 */
var Activity = require('./activity').Activity;
