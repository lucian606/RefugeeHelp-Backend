const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();
const port = 5000;
const pointRouter = require('./routes/pointRouter');
const userRouter = require('./routes/userRouter');
const emailRouter = require('./routes/emailRouter');
const cors = require('cors');

const pino = require('pino');
const pretty = require('pino-pretty');
const pinoLoki = require('pino-loki');

const options = {
    hostname: 'http://loki:3100',
    applicationTag: 'backend',
    timeout:3000,
    silenceErrors:false 
}

const streams = [
    { level: 'info', stream: pretty() },
    { level: 'info', stream: pinoLoki.createWriteStreamSync(options) },
];

let logger = pino({level:'info'}, pino.multistream(streams));

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://database:27017/refugeedb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', (error) => logger.info(error));
db.once('open', () => logger.info({message:"DB connected", tags: {someCustomTag:"mongoose"}}));

app.use(express.static('public'));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors());

app.use('/points', pointRouter);
app.use('/users', userRouter);
app.use('/emails', emailRouter);

app.listen(port, () => logger.info({line:"Backend Running", tags: {someCustomTag:"nodejs"}}));