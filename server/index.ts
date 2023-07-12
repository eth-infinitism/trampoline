import './setup-env';
import http from 'http';
import app from './app';

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
