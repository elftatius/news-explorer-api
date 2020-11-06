require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');

const { limiter } = require('./utils/rate-limiter');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const centralizedErrorHandling = require('./middlewares/error-handling');

const NotFoundError = require('./errors/not-found-err');

const router = require('./routes');

const app = express();
const port = 3000;

mongoose.connect(process.env === 'production' ? process.env.MONGO_PATH : 'mongodb://localhost:27017/newsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(limiter);

app.use(helmet());

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use('/api/', router);

app.all('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errorLogger);

app.use(errors());

app.use(centralizedErrorHandling);

app.listen(port, () => {});
