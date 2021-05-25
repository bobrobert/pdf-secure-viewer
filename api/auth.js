var config = require('../config');

function verifyToken(req, res, next) {
  var token = req.headers['x-auth-token'];
  if (!token || config.token != token)
    return res.status(403).send({ error: 'Access Denied' });
    
  next();
}

module.exports = verifyToken;