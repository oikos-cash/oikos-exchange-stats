const synthetixJs = require('../utils/snxJS-connector');

const VALID_SYNTHS_CATEGORIES = ['all', 'crypto', 'forex', 'commodity', 'index', 'equities'];
const getPairs = async (req, res) => {
	const { synths } = synthetixJs;
	const { category } = req.params;

	if (!VALID_SYNTHS_CATEGORIES.includes(category)) {
		return res.status(500).json(`${category} is not a valid synth category`);
	}

	const synthsList = (category === 'all' ? synths : synths.filter(s => s.category === category)).map(s => s.name);

	if (category !== 'forex') {
		synthsList.push('sUSD');
	}
	if (category === 'crypto') {
		synthsList.push('OKS');
	}
	let pairs = [];
	for (let i = 0; i < synthsList.length; i++) {
		for (let j = i + 1; j < synthsList.length; j++) {
			pairs.push(`${synthsList[i]}-${synthsList[j]}`);
		}
	}

	pairs = pairs.map(pair => {
		['sETH', 'sBTC', 'sUSD', 'OKS'].forEach(s => {
			if (pair.startsWith(s)) {
				pair = pair.split('-').reverse().join('-');
			}
		});
		return pair;
	});
	return res.send(pairs);
};

module.exports = getPairs;
