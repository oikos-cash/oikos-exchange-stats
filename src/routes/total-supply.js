const cache = require('memory-cache');
const synthetixJs = require('../utils/snxJS-connector');

const CACHE_LIMIT = 5 * 1000 * 60; // 5 minutes
const CACHE_KEY = 'totalSupply';

const getTotalSupply = async (req=null, res=null) => {
	
	const {
		snxJS: { Synthetix },
	} = synthetixJs;

	const totalSupply = await Synthetix.totalSupply();

	if (req != null && res != null) {
		if (cache.get(CACHE_KEY)) {
			return res.send( (cache.get(CACHE_KEY)).toString() );
		}
	
		try {
			return res.send(  (cache.put(CACHE_KEY, totalSupply / 1e18, CACHE_LIMIT)).toString()  );	
		} catch (err) {
			console.log(err);
			return res.status(500).json(err);
		}
	} else {
		if (cache.get(CACHE_KEY)) {
			return cache.get(CACHE_KEY);
		}
	
		try {
			return cache.put(CACHE_KEY, totalSupply / 1e18, CACHE_LIMIT);	
		} catch (err) {
			console.log(err);
			return err;
		}
	}
	
};

module.exports = getTotalSupply;
