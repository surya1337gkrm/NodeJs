const http = require('http');
const fs = require('fs');
const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.setHeader('content-type', 'text/html');
    res.write(`<html>
        <head>
        <title>React</title>
        </head>
        <body>
        <h1>React</h1>
        <form action="/message" method="POST">
        <input type="text" name="message"/>
        <button type="submit">
        Send
        </button>
        </form>
        </body>
        </html>
        `);
    return res.end();
  } else if (url === '/message' && method === 'POST') {
    // res.setHeader('content-type','text/html')
    // res.write(`<html>
    // <head>
    // <title>React</title>
    // </head>
    // <body>
    // <h1>Message</h1>
    // </body>
    // </html>
    // `)
    const body = [];
    req.on('data', (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });
    req.on('end', () => {
      const message = Buffer.concat(body).toString();
      fs.writeFileSync('file.txt', message.split('=')[1]);
    });
    //write req data to a file

    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }
});

//server will listen for incoming requests.
server.listen(3000, () => {
  console.log('listening on port 3000');
  //process.exit()
});
