const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
   next();
});
var config = require('./config');
app.use(express.static(__dirname + '/public/'));
const routes = require('./api/routes');
routes(app);



app.listen(port, function () {
   console.log('Server started on port: ' + port);
});
