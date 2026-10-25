import express, { Request, Response } from 'express';
import type { Server } from 'node:http';

export function createExpressServer(port = 4006): Promise<{ app: express.Express; server: Server }> {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());

    // 1. Static route
    app.get('/ping', (_req: Request, res: Response) => {
      res.json({ message: 'pong' });
    });

    // 2. Dynamic route param
    app.get('/users/:id', (req: Request, res: Response) => {
      res.json({ id: req.params.id, name: `User ${req.params.id}` });
    });

    // 3. Validated JSON body
    app.post('/items', (req: Request, res: Response) => {
      const { title, price } = req.body || {};
      if (!title || typeof title !== 'string' || title.length < 2 || typeof price !== 'number' || price < 0) {
        res.status(400).json({ error: 'Invalid body' });
        return;
      }
      res.json({ success: true, data: req.body });
    });

    const server = app.listen(port, () => {
      resolve({ app, server });
    });
  });
}
