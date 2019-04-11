const express = require('express');
const csvParse = require('csv-parse');
const http = require('http');
const fs = require('fs');



const E = process.env;
const PORT = parseInt(E['PORT']||'8000', 10);
const DATASET = 'iris.data';
const DATARATE = parseInt(E['DATARATE']||'500', 10);
const app = express();
const server = http.createServer(app);
var inputs = [], input_i = 0;
var dtime = new Date();



const dataRead = (file, data=[]) => new Promise((fres, frej) => {
  var stream = fs.createReadStream(file).pipe(csvParse());
  stream.on('error', frej);
  stream.on('end', () => fres(data));
  stream.on('data', r => data.push(r.slice(0, 4).map(parseFloat)));
});
dataRead(DATASET, inputs);

function onInterval() {
  input_i = Math.floor(Math.random()*inputs.length);
  dtime = new Date();
}
setInterval(onInterval, DATARATE);



app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  Object.assign(req.body, req.query);
  var {ip, method, url, body} = req;
  if(method!=='GET') console.log(ip, method, url, body);
  next();
});

app.get('/status', (req, res) => {
  res.json({time: dtime, inputs: inputs[input_i], unit: 'cm'});
});

app.use((err, req, res, next) => {
  console.log(err, err.stack);
  res.status(err.statusCode||err).send(err.json||err);
});
server.listen(PORT, () => {
  console.log('FLOWERANALYSISSENSOR running on '+PORT);
});
