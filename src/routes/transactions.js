const snxData = require('@oikos/oikos-data');
const { getCurrenciesFromPair } = require('../utils/currency');

const SELL_TRANSACTION = 'sell';
const BUY_TRANSACTION = 'buy';

const transactions = async (req, res) => {
	const { pair } = req.params;
	if (!pair) return res.status(500).json('Pair is missing in the params');

	const currencies = getCurrenciesFromPair(pair);
	if (!currencies) return res.status(500).json(`Could not find currencies from the pair ${pair}`);

	const { from, to } = currencies;
	const yesterday = Math.floor(Date.now() / 1e3) - 3600 * 24;
	const exchanges = await snxData.exchanges.since({
		minTimestamp: yesterday,
		max: 1000,
	});

	const pairTransactions = exchanges
		.filter(
			exchange =>
				[from.name, to.name].includes(exchange.fromCurrencyKey) ||
				[from.name, to.name].includes(exchange.toCurrencyKey),
		)
		.map(exchange => {
			const transactionType = exchange.fromCurrencyKey === from.name ? SELL_TRANSACTION : BUY_TRANSACTION;
			return {
				type: transactionType,
				amount: transactionType === SELL_TRANSACTION ? exchange.fromAmount : exchange.toAmount,
				rate:
					transactionType === SELL_TRANSACTION
						? exchange.toAmount / exchange.fromAmount
						: exchange.fromAmount / exchange.toAmount,
				ts: new Date(exchange.timestamp),
			};
		});
	return res.send(pairTransactions);
};

module.exports = transactions;
