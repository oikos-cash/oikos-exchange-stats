const { OikosJs } = require('@oikos/oikos-js-bsc');
const { ethers, getDefaultProvider } = require("ethers");
 
const networkId = 56;
const provider = getDefaultProvider("https://bsc-dataseed.binance.org")

const oksJSConnector = {
	initialized: false,
	init: function () {
		this.initialized = true;
		this.oksJS = new OikosJs({networkId, provider});
		this.synths = this.oksJS.contractSettings.synths;
		this.ethersUtils = this.oksJS.ethers.utils;
	},
};
module.exports = oksJSConnector;
