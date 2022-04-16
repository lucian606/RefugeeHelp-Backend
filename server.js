const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const app = express();
const port = 5000;
const pointRouter = require('./routes/pointRouter');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/refugeedb', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Connected to DB"));

app.use(express.static('public'));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/points', pointRouter);

app.listen(port, () => console.log(`REST API server running at http://localhost:${port}`));
