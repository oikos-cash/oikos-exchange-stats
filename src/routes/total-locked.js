const oksData = require('@oikos/oikos-data-bsc');
const cache = require('memory-cache');

const oikosJs = require('../utils/oksJS-connector');

const CACHE_LIMIT = 60 * 1000 * 60; // 60 minutes
const CACHE_KEY = 'totalLocked';

const getTotalLocked = async (req=null, res=null) => {
	const {
		oksJS: { ExchangeRates, OikosState, Oikos },
		ethersUtils: { formatBytes32String },
	} = oikosJs;

	if (cache.get(CACHE_KEY)) {
		if (req != null && res != null) {
			return res.send({ totalLocked: cache.get(CACHE_KEY) });
		} else {
			return cache.get(CACHE_KEY);
		}
	}
	 
	try {

		console.log(oksData)
		let oksLocked = 0;
		let oksTotal = 0;
		const holders = await oksData.snx.holders({ max: 1000 });
		//console.log(holders)
		const [
			unformattedLastDebtLedgerEntry,
			unformattedTotalIssuedSynths,
			unformattedIssuanceRatio,
			unformattedUsdTooksPrice,
			unformattedTotalSupply,
		] = await Promise.all([
			OikosState.lastDebtLedgerEntry(),
			Oikos.totalIssuedSynths(formatBytes32String('oUSD')),
			OikosState.issuanceRatio(),
			ExchangeRates.rateForCurrency(formatBytes32String('OKS')),
			Oikos.totalSupply(),
		]);

		
		const lastDebtLedgerEntry = unformattedLastDebtLedgerEntry / 1e27;

		const [totalIssuedSynths, issuanceRatio, usdTooksPrice, totalSupply] = [
			unformattedTotalIssuedSynths,
			unformattedIssuanceRatio,
			unformattedUsdTooksPrice,
			unformattedTotalSupply,
		].map(val => val / 1e18);

		holders.forEach(({ collateral, debtEntryAtIndex, initialDebtOwnership }) => {
			let debtBalance = ((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
			let collateralRatio = debtBalance / collateral / usdTooksPrice;
			if (isNaN(debtBalance) || collateral == 0) {
				debtBalance = 0;
				collateralRatio = 0;
			}

			oksLocked += collateral * Math.min(1, collateralRatio / issuanceRatio);
			oksTotal += collateral;
		});

		const marketCap = usdTooksPrice * totalSupply;

		console.log(marketCap, oksLocked, oksTotal);

		const totalLockedValue = (marketCap * oksLocked) / oksTotal;

		cache.put(CACHE_KEY, totalLockedValue, CACHE_LIMIT);
				

		if (req != null && res != null) {
			return res.send( oksLocked );
		} else {
			return oksLocked;
		}

	} catch (e) {
		console.log(e);
		return res.status(500).json('Could not get total locked value');
	}
};

module.exports = getTotalLocked;
