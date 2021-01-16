const snxData = require('@oikos/oikos-data');
const cache = require('memory-cache');
const synthetixJs = require('../utils/snxJS-connector');
const { getCurrenciesFromPair } = require('../utils/currency');

const CACHE_LIMIT = 3 * 1000 * 60; // 3 minute

const ticker = async (req, res) => {
	const { pair } = req.params;
	if (!pair) return res.status(500).json('Pair is missing in the params');

	const currencies = getCurrenciesFromPair(pair);
	if (!currencies) return res.status(500).json(`Could not find currencies from the pair ${pair}`);

	const { from, to } = currencies;
	if (cache.get(`ticker:${from.name}-${to.name}`)) {
		return res.send(cache.get(`ticker:${from.name}-${to.name}`));
	}

	const {
		snxJS: { ExchangeRates },
		ethersUtils: { formatBytes32String },
	} = synthetixJs;

	const yesterday = Math.floor(Date.now() / 1e3) - 3600 * 24;
	try {
		const [fromRate, toRate, exchangeHistory] = await Promise.all([
			ExchangeRates.rateForCurrency(formatBytes32String(from.name)),
			ExchangeRates.rateForCurrency(formatBytes32String(to.name)),
			snxData.exchanges.since({
				minTimestamp: yesterday,
				max: 5000,
			}),
		]);

		const pairExchangeHistory = exchangeHistory.filter(
			exchange =>
				(exchange.fromCurrencyKey === from.name && exchange.toCurrencyKey === to.name) ||
				(exchange.fromCurrencyKey === to.name && exchange.toCurrencyKey === from.name),
		);

		const volumeDefault = {
			totalFrom: 0,
			totalTo: 0,
			lowTo: 0,
			lowFrom: 0,
			highTo: 0,
			highFrom: 0,
		};

		const volumes = {
			[from.name]: { ...volumeDefault },
			[to.name]: { ...volumeDefault },
		};

		pairExchangeHistory.forEach(exchange => {
			const { fromCurrencyKey, fromAmount, toAmount } = exchange;
			const currentKey = volumes[fromCurrencyKey];
			const rateFrom = fromAmount / toAmount;
			const rateTo = toAmount / fromAmount;

			currentKey.totalFrom += fromAmount;
			currentKey.totalTo += toAmount;

			if (!currentKey.lowFrom || currentKey.lowFrom > rateFrom) {
				currentKey.lowFrom = rateFrom;
			}
			currentKey.lowTo = !currentKey.lowTo ? rateTo : currentKey.lowTo > rateTo ? rateTo : currentKey.lowTo;
			currentKey.highFrom = currentKey.highFrom < rateFrom ? rateFrom : currentKey.highFrom;
			currentKey.highTo = currentKey.highTo < rateTo ? rateTo : currentKey.highTo;
		});

		const rate = fromRate / 1e18 / (toRate / 1e18);

		const ticker = {
			symbol: `${from.name}-${to.name}`,
			rate,
			bid: rate,
			ask: rate,
			volume24hFrom: volumes[from.name].totalFrom + volumes[to.name].totalTo,
			volume24hTo: volumes[from.name].totalTo + volumes[to.name].totalFrom,
			low24hRate: Math.min(volumes[from.name].lowTo, volumes[to.name].lowFrom),
			high24hRate: Math.max(volumes[from.name].highTo, volumes[to.name].highFrom),
		};
		cache.put(`ticker:${from.name}-${to.name}`, ticker, CACHE_LIMIT);
		return res.send(ticker);
	} catch (e) {
		console.log(e);
		return res.status(500).json(`Could not fetch the data for pair ${pair}`);
	}
};

module.exports = ticker;
