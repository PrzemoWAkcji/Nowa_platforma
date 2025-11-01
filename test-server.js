const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!');
});

const port = 3003;
server.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});