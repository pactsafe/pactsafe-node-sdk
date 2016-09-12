'use strict';

/**
 * Expose `Signer`.
 */
module.exports = exports = Signer;

/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter,
  __pkg = require('../package.json'),
  utils = require('./utils'),
  _ = require('lodash'),
  assert = require('assert'),
  debug = require('debug')(__pkg.name + ':Signer'),
  bson = require('bson'),
  type = require('component-type'),
  clone = require('clone'),
  join = require('join-component'),
  request = require('superagent'),
  retry = require('superagent-retry')(request);

/**
 * Module class dependencies.
 */
var Activity = require('./activity').Activity;

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
 * Inherit from EventEmitter.
 */
Signer.prototype = Object.create(EventEmitter.prototype);
Signer.prototype.constructor = Signer;

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
  utils.validate(custom_data);
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
  callback = callback || _.noop;
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
  callback = callback || _.noop;
  this.client.latest(signer_id, contracts, callback);
  return this;
};
