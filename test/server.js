process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var express = require('express');
var httpProxy = require('http-proxy');
var http = require('http');
var debug = require('debug')('pactsafe-activity:server');
var ports = exports.ports = { source: 4063, proxy: 4064 };
var Activity = require('..');

var activity = Activity('4163db85-2a9d-4bba-b74e-ad12375d7a42', {
  //host: 'http://localhost:4063',
  host: 'https://response.pactsafe.dev:3002',
  flushAt: 1,
  test_mode: true
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
 * App.
 */
 
var app = express()
  .use(express.bodyParser())
  .use(express.basicAuth('4163db85-2a9d-4bba-b74e-ad12375d7a42', ''));

exports.app = app;

/**
 * Fixture.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Funtion} next
 */

exports.fixture = function(req, res, next) {
  var batch = req.body.batch;
  if ('error' == batch[0]) return res.json(400, { error: { message: 'error' }});
  res.json(200);
};

exports.respond = function(req, res, next) {
  activity.load(req.query.gkey || 'ps-login-clickwrap', { order_id: '123abc' }, function(err, group) {
    if (err) return res.status(400).json(err);
    
    group.render({}, function(err, reply) {
      if (err) return res.status(400).json(err);
      res.json(group);
    });
  });

/*
  activity.retrieve(req.query.sig || 'adamrgillaspie@gmail.com', [ 1, 2, 3, 4 ], function(err, reply) {
    if (err) return res.status(400).json(err);
    console.dir(reply);
    res.json(reply);
  });
*/

/*
  activity.agreed({
    signer_id: 'adam@pactsafe.com',
    contracts: [ 1, 2 ],
    versions: [ '57acb5b490cb50b4220f196b', '57acb71390cb50b4220f196c' ]
  }, function(err, reply) {
    if (err) return res.status(400).json(err);
    res.json(reply);
  });
*/
};

app
  .post('/v1/batch', exports.fixture)
  .get('/retrieve', exports.respond)
  .listen(ports.source, function() {
    console.info('[%s] Express server started: %s:%s', new Date().toISOString(), 'localhost', ports.source);
  });
