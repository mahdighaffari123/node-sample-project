const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
//Global middlewares
//Set security http headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json());

// Development logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip, please try in an hour',
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution, using duplicated parameters
app.use(
  hpp({
    whitelist: ['duration'],
  })
);

// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
