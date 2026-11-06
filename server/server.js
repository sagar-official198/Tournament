import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { initIO } from './sockets/io.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
const origins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean)
  : true;

app.set('trust proxy', 1);
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initIO(server, origins);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => server.listen(PORT, () => console.log(`Kabaddi server running on port ${PORT}`)))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
