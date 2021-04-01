const synthetixJs = require('./snxJS-connector');

module.exports.getCurrenciesFromPair = pair => {
	const { synths } = synthetixJs;
	
	let [from, to] = pair.split('-');
	 
	if (!from || !to) return null;

	from = synths.find(s => s.name.toLowerCase() === from.toLowerCase());
	to = synths.find(s => s.name.toLowerCase() === to.toLowerCase());

	if (!from || !to) return null;

	return { from, to };
};
