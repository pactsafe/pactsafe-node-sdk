process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const bodyParser = require('body-parser');
const express = require('express');
const httpProxy = require('http-proxy');
const http = require('http');
const _ = require('lodash');
const ports = exports.ports = { source: 4063, proxy: 4064 };

/**
 * Create sample Activity client.
 */
const pactsafe = require('..');
const activity = new pactsafe.Activity('00000000-0000-0000-0000-000000000000', { test_mode: true }, {
  host: 'http://localhost:4063',
  flush_at: 1
});

/**
 * Proxy.
 */
const proxy = httpProxy.createProxyServer();

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
const app = express().use(bodyParser.json({ limit: '16mb' }));
let server;
app.post('/send', exports.fixture);
app.get('/send', exports.send);
app.get('/retrieve', exports.respond);
app.get('/load', exports.load);

exports.start = (cb) => {
  server = app.listen(ports.source, () => {
    console.info('[%s] Express server started: %s:%s', new Date().toISOString(), 'localhost', ports.source);
    cb();
  });
};

exports.stop = cb => server.close(cb);