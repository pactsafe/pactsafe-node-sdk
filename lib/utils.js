'use strict';

/**
 * Module dependencies.
 */
const assert = require('assert');
const type = require('component-type');
const join = require('join-component');
const __pkg = require('../package.json');
const debug = require('debug')(__pkg.name + ':utils');

/**
 * Map of full parameter names to their
 * query string codes and types.
 *
 * Only the parameters listed in this map
 * will be included in the `send` payload.
 */
var _parameterMap = exports.parameterMap = {
  access_id: {
    code: 'sid',
    type: 'string'
  },
  site_id: {
    code: 'sid',
    type: 'string'
  },
  event_type: {
    code: 'et',
    type: 'string'
  },
  signer_id: {
    code: 'sig',
    type: ['string', 'number']
  },
  uuid: {
    code: 'uid',
    type: 'string'
  },
  contract: {
    code: 'cid',
    type: 'array'
  },
  contracts: {
    code: 'cid',
    type: 'array'
  },
  version: {
    code: 'vid',
    type: 'array'
  },
  versions: {
    code: 'vid',
    type: 'array'
  },
  revision: {
    code: 'rev',
    type: 'array'
  },
  revisions: {
    code: 'rev',
    type: 'array'
  },
  group: {
    code: 'gid',
    type: ['string', 'number']
  },
  key: {
    code: 'gkey',
    type: 'string'
  },
  request: {
    code: 'srid',
    type: 'string'
  },
  external: {
    code: 'xt',
    type: 'boolean'
  },
  external_url: {
    code: 'xtu',
    type: 'array'
  },
  external_urls: {
    code: 'xtu',
    type: 'array'
  },
  custom_data: {
    code: 'cus',
    type: 'object'
  },
  page_title: {
    code: 'pat',
    type: 'string'
  },
  page_url: {
    code: 'pau',
    type: 'string'
  },
  page_domain: {
    code: 'pad',
    type: 'string'
  },
  page_path: {
    code: 'pap',
    type: 'string'
  },
  page_query: {
    code: 'paq',
    type: 'string'
  },
  referrer: {
    code: 'ref',
    type: 'string'
  },
  remote_address: {
    code: 'addr',
    type: 'string'
  },
  user_agent: {
    code: 'bua',
    type: 'string'
  },
  browser_timezone: {
    code: 'btz',
    type: ['number', 'string']
  },
  browser_locale: {
    code: 'bl',
    type: 'string'
  },
  operating_system: {
    code: 'os',
    type: 'string'
  },
  environment: {
    code: 'env',
    type: 'string'
  },
  screen_color_depth: {
    code: 'scd',
    type: 'string'
  },
  screen_resolution: {
    code: 'res',
    type: 'string'
  },
  render_id: {
    code: 'rdid',
    type: 'string'
  },
  render_data: {
    code: 'rnd',
    type: 'object'
  },
  dynamic: {
    code: 'dyn',
    type: 'boolean'
  },
  certification_token: {
    code: '_ct',
    type: 'boolean'
  },
  confirmation_email: {
    code: 'cnf',
    type: 'boolean'
  },
  test_mode: {
    code: 'tm',
    type: 'boolean'
  },
  silent_error: {
    code: '_noerr',
    type: 'boolean'
  },
  server_side: {
    code: '_srv',
    type: 'boolean'
  },
  client_library: {
    code: '_lib',
    type: 'string'
  },
  client_version: {
    code: '_libv',
    type: 'string'
  }
};

/**
 * Validate parameter and option types.
 *
 * @param {Object} obj
 */
exports.validate = function(obj) {
  assert('object' == type(obj), 'You must pass an action object.');
  for (var key in _parameterMap) {
    var val = obj[key];
    if ('undefined' == type(val) || 'null' == type(val)) continue;
    var exp = _parameterMap[key].type;
    exp = ('array' === type(exp) ? exp : [exp]);
    var a = 'object' == exp ? 'an' : 'a';
    assert(exp.some(function(e) { return type(val) === e }), '"' + key + '" must be ' + a + ' ' + join(exp, 'or') + '.');
  }
};

/**
 * Get an error from a `res`.
 *
 * @param {Object} res
 * @return {Error}
 */
exports.error = function(res) {
  if (!res.error) return;
  var body = res.body,
    msg = body.error && (body.error.message || res.status) + ' ' + res.text,
    err = new Error(msg);
  debug('error: %o', err.stack);
  return err;
};
