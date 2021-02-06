const getTotalSupply = require('./total-supply');
const getTotalLocked = require('./total-locked');
const cache = require('memory-cache');

const CACHE_LIMIT = 5 * 1000 * 60; // 5 minutes
const CACHE_KEY = 'circulatingSupply';

const getCirculatingSupply = async (req, res) => {

    if (cache.get(CACHE_KEY)) {
        return res.send( (cache.get(CACHE_KEY)).toString() );
    }

    try {
        const totalSupply = await getTotalSupply();
        const totalLocked = await getTotalLocked();

        console.log(totalSupply)
        console.log(totalLocked)

        const circulatingSupply = (totalSupply - totalLocked) * 1e18;

        return res.send(  (cache.put(CACHE_KEY, circulatingSupply / 1e18, CACHE_LIMIT)).toString()  );
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
}
module.exports = getCirculatingSupply;



