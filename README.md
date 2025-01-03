# ExpressJS graceful shutdown example.

- install dependencies `npm i`
- start the application `node index.js`
- connect to the server `telnet 127.0.0.1 3000`
- stop the application with `ctrl-c`
- application will not stop because of the active client connection
- type `GET / HTTP/1.1` on terminal with the telnet session and press enter/return twice
- you will see the server response with `Connection: Close` response header and connection will be terminated, then
  application will exit
- comment out the [line](https://github.com/artursudnik/keep-alive-demo/blob/main/index.mjs#L51)
  containing `res.set('Connection', 'Close');`
- start the application and repeat all the steps
- connection will not be terminated and application will not exit until killed or connection closed by the client
