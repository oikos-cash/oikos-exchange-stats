const snxData = require('@oikos/oikos-data');
const cache = require('memory-cache');

const synthetixJs = require('../utils/snxJS-connector');

const CACHE_LIMIT = 60 * 1000 * 60; // 60 minutes
const CACHE_KEY = 'totalLocked';

const getTotalLocked = async (req, res) => {
	const {
		snxJS: { ExchangeRates, SynthetixState, Synthetix },
		ethersUtils: { formatBytes32String },
	} = synthetixJs;

	if (cache.get(CACHE_KEY)) {
		return res.send({ totalLocked: cache.get(CACHE_KEY) });
	}
	console.log({o:synthetixJs.snxJS})

	try {
		let snxLocked = 0;
		let snxTotal = 0;
		const holders = await snxData.snx.holders({ max: 1000 });
		const [
			unformattedLastDebtLedgerEntry,
			unformattedTotalIssuedSynths,
			unformattedIssuanceRatio,
			unformattedUsdToSnxPrice,
			unformattedTotalSupply,
		] = await Promise.all([
			SynthetixState.lastDebtLedgerEntry(),
			Synthetix.totalIssuedSynths(formatBytes32String('sUSD')),
			SynthetixState.issuanceRatio(),
			ExchangeRates.rateForCurrency(formatBytes32String('OKS')),
			Synthetix.totalSupply(),
		]);

		
		const lastDebtLedgerEntry = unformattedLastDebtLedgerEntry / 1e27;

		const [totalIssuedSynths, issuanceRatio, usdToSnxPrice, totalSupply] = [
			unformattedTotalIssuedSynths,
			unformattedIssuanceRatio,
			unformattedUsdToSnxPrice,
			unformattedTotalSupply,
		].map(val => val / 1e18);

		holders.forEach(({ collateral, debtEntryAtIndex, initialDebtOwnership }) => {
			let debtBalance = ((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
			let collateralRatio = debtBalance / collateral / usdToSnxPrice;
			if (isNaN(debtBalance)) {
				debtBalance = 0;
				collateralRatio = 0;
			}
			snxLocked += collateral * Math.min(1, collateralRatio / issuanceRatio);
			snxTotal += collateral;
		});

		const marketCap = usdToSnxPrice * totalSupply;
		const totalLockedValue = (marketCap * snxLocked) / snxTotal;
		cache.put(CACHE_KEY, totalLockedValue, CACHE_LIMIT);
		return res.send({ totalLockedValue });
	} catch (e) {
		console.log(e);
		return res.status(500).json('Could not get total locked value');
	}
};

module.exports = getTotalLocked;
