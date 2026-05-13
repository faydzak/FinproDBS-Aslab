import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
 
import matchesRouter from './routes/matches.js';
import playersRouter from './routes/players.js';
import statisticsRouter from './routes/statistics.js';
import authRouter from './routes/auth.js';
import { attachUser } from './middleware/auth.js';
 
const app = express();
const PORT = Number(process.env['PORT'] ?? 5000);
 

app.use(cors({
  origin: process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:3000',
  credentials: true,
}));
 
app.use(express.json());
app.use(cookieParser());
 
//  req.user from the session cookie on every request (null when nothing).
app.use(attachUser);
 
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
 
app.use('/api/auth',       authRouter);
app.use('/api/matches',    matchesRouter);
app.use('/api/players',    playersRouter);
app.use('/api/statistics', statisticsRouter);
 
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
