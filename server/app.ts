import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Express = express();

app.use(cors());

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('TypeScript Server');
});

routes(app);

export default app;
