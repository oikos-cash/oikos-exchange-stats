const express = require('express');
const cors = require('cors');

const getTotalSupply = require('./total-supply');
const getPairs = require('./pairs');
const getTicker = require('./ticker');
const getTotalLocked = require('./total-locked');
const getCirculatingSupply = require('./circulating-supply');

const router = express.Router();

const corsOptions = {
	origin: 'https://accounts.coinmarketcap.com',
  }

router.get('/alive', (req, res) => {
	res.send('API is live');
});

router.get('/api/total-locked',  getTotalLocked);
router.get('/api/total-supply', cors(corsOptions), getTotalSupply);
router.get('/api/circulating-supply', cors(corsOptions), getCirculatingSupply);
router.get('/api/pairs/:category', getPairs);
router.get('/api/ticker/:pair', getTicker);

module.exports = router;
