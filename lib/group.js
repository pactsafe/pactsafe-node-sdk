'use strict';

/**
 * Expose `Group`.
 */
module.exports = exports = Group;

/**
 * Module dependencies.
 */
const _ = require('lodash');
const assert = require('assert');
const request = require('superagent');
const utils = require('./utils');
const __pkg = require('../package.json');
const debug = require('debug')(__pkg.name + ':Group');
const { EventEmitter } = require('events');

require('superagent-retry')(request);

/**
 * Module class dependencies.
 */
const Activity = require('./activity').Activity;

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
 * Inherit from EventEmitter.
 */
Group.prototype = Object.create(EventEmitter.prototype);
Group.prototype.constructor = Group;

/**
 * Return parameters object when converting to JSON.
 *
 * @return {Object}
 */
Group.prototype.toJSON = function() {
  return this.parameters;
};

/**
 * Get `parameter` by name.
 *
 * @param {String} name
 * @return {Mixed}
 */
Group.prototype.get = function(name) {
  assert(name, 'You must pass a parameter "name".');
  return this.parameters[name];
};

/**
 * Set parameters.
 *
 * @param {Object} parameters
 * @return {Group}
 */
Group.prototype.set = function(parameters) {
  parameters = parameters || {};
  utils.validate(parameters);
  this.parameters = _.extend({}, this.parameters, parameters, { key: this.key });
  return this;
};

/**
 * Send an agreed `action`.
 *
 * @param {String} signer_id
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Group}
 */
Group.prototype.agreed = function(signer_id, action, callback) {
  utils.validate(action);
  var data = _.extend({}, this.parameters, action);
  this.client.agreed(signer_id, data, callback);
  return this;
};

/**
 * Send a disagreed `action`.
 *
 * @param {String} signer_id
 * @param {Object} action
 * @param {Function} callback (optional)
 * @return {Group}
 */
Group.prototype.disagreed = function(signer_id, action, callback) {
  utils.validate(action);
  var data = _.extend({}, this.parameters, action);
  this.client.disagreed(signer_id, data, callback);
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
  utils.validate(action);
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
  callback = callback || _.noop;
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
  callback = callback || _.noop;
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
  callback = callback || _.noop;
  render_data = render_data || self.parameters.render_data || {};
  utils.validate(render_data);

  var data = self.client.build({
    event_type: 'load',
    key: self.parameters.key,
    render_id: null,
    render_data: render_data
  });

  var req = request
    .post(self.client.options.host + '/load/json')
    .retry(3)
    .send(data)
    .end(function(err, res) {
      err = err || utils.error(res);
      if (err) return callback(err);
      self.set(res.body);
      self.emit('reloaded', self);
      callback(err, self);
      debug('reload: %o', data);
    });

  return self;
};
