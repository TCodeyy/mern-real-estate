import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {});

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
  console.log('server is running on port 3000');
});

//we are index.js to use these routes when this api is hit
console.log('Mounting userRouter at /api/user');
app.use('/api/user', userRouter);
console.log('Mounting userRouter at /api/auth');
app.use('/api/auth', authRouter);
console.log('Mounting userRouter at /api/listing');
app.use('/api/listing', listingRouter);

app.use(express.static(path.join(__dirname, '/client/dist'))); // if we used create react app , dist would be 'build'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

//create middleware to catch errors
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
