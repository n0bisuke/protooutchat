'use strict';

const express = require('express');
const tokenGen = require('./libs/token');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static('public'));

app.get('/token', (req, res) => res.send({tokenString: tokenGen()}));

app.listen(PORT);

console.log(`Server running at ${PORT}`);
console.log(process.version)
