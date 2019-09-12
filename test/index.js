const assert = require('assert');
const server = require('./server');
const pactsafe = require('..');
const Activity = pactsafe.Activity;

let a;
let noop = function() {};
const access_id = '00000000-0000-0000-0000-000000000000';

describe('Activity', function() {
  before(done => server.start(done));
  after(done => server.stop(done));

  beforeEach(function() {
    a = Activity(access_id, {}, {
      host: 'http://localhost:4063',
      flush_at: Infinity,
      flush_after: Infinity
    });
  });

  it('should expose a constructor', function() {
    assert.equal('function', typeof Activity);
  });

  it('should require an access_id', function() {
    assert.throws(Activity, error('You must pass your PactSafe Site\'s Access ID.'));
  });

  it('should not require the new keyword', function() {
    assert(a instanceof Activity);
  });

  it('should create a queue', function() {
    assert.deepEqual(a.queue, []);
  });

  it('should set default options', function() {
    var a = Activity(access_id);
    assert.equal(a.access_id, access_id);
    assert.equal(a.options.host, 'https://pactsafe.io');
    assert.equal(a.options.flush_at, 20);
    assert.equal(a.options.flush_after, 10000);
  });

  it('should take options', function() {
    const a = Activity(access_id, {}, {
      host: 'a',
      flush_at: 1,
      flush_after: 2
    });

    assert.equal(a.options.host, 'a');
    assert.equal(a.options.flush_at, 1);
    assert.equal(a.options.flush_after, 2);
  });

  it('should keep the flush_at option above zero', function() {
    const a = Activity(access_id, {}, { flush_at: 0 });
    assert.equal(a.options.flush_at, 1);
  });
});

/**
 * Create a queue with `actions`.
 *
 * @param {Activity} a
 * @param {Array} actions
 * @return {Array}
 */
function enqueue(a, actions) {
  a.queue = actions.map(function(action) {
    return {
      action: action,
      callback: noop
    };
  });
}

/**
 * Assert an error with `message` is thrown.
 *
 * @param {String} message
 * @return {Function}
 */
function error(message) {
  return function(err) {
    return err.message == message;
  };
}
