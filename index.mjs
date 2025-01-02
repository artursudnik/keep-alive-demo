import http from 'http';
import express from 'express';
import os from 'os';

const server = http.createServer();

// below are defaults (nodejs v19) set explicitly
server.timeout = 0; // https://nodejs.org/api/http.html#servertimeout
server.keepAliveTimeout = 5000; // https://nodejs.org/api/http.html#serverkeepalivetimeout
server.headersTimeout = 60000; // https://nodejs.org/api/http.html#serverheaderstimeout
server.requestTimeout = 300000; // https://nodejs.org/api/http.html#serverrequesttimeout

server.on('connection', (socket) => {
  const start = new Date();

  console.log(
    `[${new Date().toISOString()}]`,
    `new connection from ${socket.remoteAddress}:${socket.remotePort}`
  );

  socket.on('close', (hadError) => {
    console.log(
      `[${new Date().toISOString()}]`,
      `connection from ${socket.remoteAddress}:${socket.remotePort} closed${
        hadError ? ' with error' : ''
      }, ` +
        `br=${socket.bytesRead}, bw=${socket.bytesWritten}, elapsed=${
          new Date().getTime() - start.getTime()
        }`
    );
  });
});

const PORT = process.env.PORT || 3000;
const BIND = process.env.BIND || '127.0.0.1';

server.on('listening', () => {
  console.log(
    `[${new Date().toISOString()}]`,
    `server listening on http://${BIND}:${PORT}`
  );
});

const app = express();

let shutdownInitiated = false;

app.use((req, res) => {
  const start = Date.now();

  if (shutdownInitiated) {
    // without this, connected client can send requests endlessly and process will not exit
    res.set('Connection', 'Close');
  }

  setTimeout(() => {
    res.send('OK\n');
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`;
    console.log(logMessage);
  }, 100);
});

server.on('request', app);

server.listen(PORT, BIND);

['SIGHUP', 'SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    shutdownInitiated = true;

    console.log(
      `${signal === 'SIGINT' ? '\n' : ''}[${new Date().toISOString()}]`,
      `process received a ${signal} (${os.constants.signals[signal]}) signal`
    );

    console.log(`[${new Date().toISOString()}]`, 'stopping the server');

    server.close((err) => {
      if (err) {
        console.log(
          `[${new Date().toISOString()}]`,
          `server closed with error ${err}`
        );
      } else {
        console.log(
          `[${new Date().toISOString()}]`,
          'server is stopping accepting new connections ' +
            'and waiting for active connections to be closed'
        );
      }

      process.exit(err ? 1 : 0);
    });

    process.on('exit', (code) => {
      console.log(`[${new Date().toISOString()}]`, `exiting with code ${code}`);
    });
  });
});
