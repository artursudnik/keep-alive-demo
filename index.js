'use strict';

const http = require('http');
const express = require('express');

const server = http.createServer();

// below are defaults (nodejs v19) set explicitly
server.timeout = 0; // https://nodejs.org/api/http.html#servertimeout
server.keepAliveTimeout = 5000; // https://nodejs.org/api/http.html#serverkeepalivetimeout
server.headersTimeout = 60000; // https://nodejs.org/api/http.html#serverheaderstimeout
server.requestTimeout = 300000; // https://nodejs.org/api/http.html#serverrequesttimeout

const PORT = process.env.PORT || 3000;
const BIND = process.env.BIND || '127.0.0.1';

const app = express();

let shutdownInitiated = false;

app.get('*', (req, res) => {
  if (shutdownInitiated) {
    // without this, connected client can send requests endlessly and process will not exit
    res.set('Connection', 'Close');
  }

  setTimeout(() => {
    res.send('OK\n');
  }, 100);
});

server.on('request', app);

server.listen(PORT, BIND);

['SIGHUP', 'SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    shutdownInitiated = true;

    server.close((err) => {
      process.exit(err ? 1 : 0);
    });
  });
});
