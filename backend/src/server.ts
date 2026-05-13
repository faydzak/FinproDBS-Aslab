import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import matchesRouter from './routes/matches.js';
import playersRouter from './routes/players.js';
import statisticsRouter from './routes/statistics.js';

const app = express();
const PORT = Number(process.env['PORT'] ?? 5000);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/matches', matchesRouter);
app.use('/api/players', playersRouter);
app.use('/api/statistics', statisticsRouter);

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
