import express, { Request, Response } from 'express';
import morgan from 'morgan';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Morgan token to log request body
// Cast req as express.Request to access body
morgan.token('body', (req) => JSON.stringify((req as express.Request).body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

// Catch-all route to echo request body
app.all('*', (req: Request, res: Response) => {
  res.json({
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    headers: req.headers,
    query: req.query
  });
});

app.listen(port, () => {
  console.log(`Echo server running on port ${port}`);
});
