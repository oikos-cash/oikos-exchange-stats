const { SynthetixJs } = require('@oikos/oikos-js');
const { providers } = require('ethers');

const ETHEREUM_NETWORK = 'homestead';

const provider = new providers.InfuraProvider(ETHEREUM_NETWORK, process.env.INFURA_PROJECT_ID);

const snxJSConnector = {
	initialized: false,
	init: function () {
		this.initialized = true;
		this.snxJS = new SynthetixJs({networkId:1});
		this.synths = this.snxJS.contractSettings.synths;
		this.ethersUtils = this.snxJS.ethers.utils;
	},
};
module.exports = snxJSConnector;
