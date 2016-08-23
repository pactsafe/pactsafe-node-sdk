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
 * Initialize a new `Signer` with the parent `Activity`
 * client, a unique `signer_id`, and a `custom_data` object.
 *
 * @param {Activity} client
 * @param {String} signer_id
 * @param {Object} custom_data (optional)
 */
function Signer(client, signer_id, custom_data) {
  if (!(this instanceof Signer)) return new Signer(client, signer_id, custom_data);
  assert(client && (client instanceof Activity), 'You must pass an "Activity" client.');
  assert(signer_id, 'You must pass a "signer_id".');
  custom_data = custom_data || {};
  
  this.client = client;
  this.signer_id = signer_id;
  this.uuid = new bson.ObjectId().toJSON();
  this.agreed = {};
  this.rendered = {};
  
  this.custom_data = {};
  this.set(custom_data);
}

/**
 * Return parameters object when converting to JSON.
 *
 * @return {Object}
 */
Signer.prototype.toJSON = function() {
  return { signer_id: this.signer_id, uuid: this.uuid, custom_data: this.custom_data };
};

/**
 * Get `custom_data` value by name.
 *
 * @param {String} name
 * @return {Mixed}
 */
Signer.prototype.get = function(name) {
  assert(name, 'You must pass a custom_data "name".');
  return this.custom_data[name];
};

/**
 * Set `custom_data`.
 *
 * @param {Object} custom_data
 * @return {Signer}
 */
Signer.prototype.set = function(custom_data) {
  custom_data = custom_data || {};
  validate(custom_data);
  this.custom_data = _.extend({}, this.custom_data, custom_data);
  return this;
};

/**
 * Retrieve the versions of the specified
 * contracts that the signer has accepted.
 *
 * @param {Array} contracts
 * @param {Function} callback
 * @return {Signer}
 */
Signer.prototype.retrieve = function(contracts, callback) {
  callback = callback || noop;
  this.client.retrieve(this.signer_id, contracts, callback);
  return this;
};

/**
 * Retrieve a boolean for each contract,
 * indicating if the signer has accepted
 * the latest version.
 *
 * @param {Array} contracts
 * @param {Function} callback
 * @return {Signer}
 */
Signer.prototype.latest = function(contracts, callback) {
  callback = callback || noop;
  this.client.latest(signer_id, contracts, callback);
  return this;
};

/**
 * Validation rules.
 */
var rules = {
  signer_id: 'string'
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
module.exports = Signer;
module.exports.Signer = Signer;

/**
 * Module classes.
 */
var Activity = require('./activity').Activity;
