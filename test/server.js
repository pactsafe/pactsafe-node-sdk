process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var __pkg = require('../package.json'),
  express = require('express'),
  httpProxy = require('http-proxy'),
  http = require('http'),
  _ = require('lodash'),
  debug = require('debug')(__pkg.name + ':server'),
  ports = exports.ports = { source: 4063, proxy: 4064 };

/**
 * Create sample Activity client.
 */
var pactsafe = require('..');
var activity = new pactsafe.Activity('00000000-0000-0000-0000-000000000000', { test_mode: true }, {
  host: 'http://localhost:4063',
  flush_at: 1
});

/**
 * Proxy.
 */
var proxy = httpProxy.createProxyServer();

exports.proxy = http.createServer(function(req, res) {
  proxy.web(req, res, { target: 'http://localhost:' + ports.source });
});

proxy.on('proxyRes', function (proxyRes, req, res) {
  proxyRes.statusCode = 408;
});

/**
 * Sample routes.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Funtion} next
 */
exports.fixture = function(req, res, next) {
  var params = _.isEmpty(req.body) ? req.query : req.body;
  res.json(params);
};

exports.send = function(req, res, next) {
  activity.load(req.query.gkey, { order_id: '123abc' }, function(err, group) {
    if (err) return res.status(err.status || 400).json(err);
    
    activity.agreed(req.query.sig, { render_id: group.get('render_id') }, function(err, reply) {
      if (err) return res.status(err.status || 400).json(err);
      res.json(reply);
    });
  });
};

exports.respond = function(req, res, next) {
  activity.retrieve(req.query.sig, null, function(err, reply) {
    if (err) return res.status(err.status || 400).json(err);
    res.json(reply);
  });
};

exports.load = function(req, res, next) {
  activity.load(req.query.gkey, { order_id: '123abc' }, function(err, group) {
    if (err) return res.status(err.status || 400).json(err);
    res.json(group);
  });
};

/**
 * App.
 */
exports.app = express()
  .use(express.bodyParser());

exports.app
  .post('/send', exports.fixture)
  .get('/send', exports.send)
  .get('/retrieve', exports.respond)
  .get('/load', exports.load);

exports.app.listen(ports.source, function() {
  console.info('[%s] Express server started: %s:%s', new Date().toISOString(), 'localhost', ports.source);
});
