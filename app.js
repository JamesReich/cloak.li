import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
const app = express();
import cors from 'cors';

connectDB();

import indexRouter from './routes/index.js';
import urlsRouter from './routes/urls.js';

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS
const corsOptions = {
    origin: ['https://cloak.li', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use('/', indexRouter);
app.use('/api', urlsRouter);


// Server Setup
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
});