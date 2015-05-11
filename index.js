var bitcore = require('bitcore');
var Networks = bitcore.Networks;

module.exports = {
	generateWallet: function(testnet) {
		if (testnet) {
			network = Networks.testnet;
		}else {
			network = Networks.livenet;
		}

		var privateKey = new bitcore.PrivateKey(Networks.testnet); // Creating a new PrivateKey for use on the testnet

		return {
			publicKey: privateKey.publicKey.toAddress().toString(),
			privateKey: privateKey.toString()
		};
	},


};