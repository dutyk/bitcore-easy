var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');
var Networks = bitcore.Networks;
var insight = null;

/**
* Generates a new Public and Private key pair
* 
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {object} {publicKey: String, privateKey: String}
*/
function generateWallet(testnet) {
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
}

/**
* Returns a list of unspent transactions outputs (utxos) for the given public address
* 
* @param {string} publicKey The public address to check for utxos 
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {array}
*/
function getWalletUtxos(publicKey, testnet, callback) {
	var nodeURL = null,
		network = null;

	if (testnet) {
		nodeURL = 'https://test-insight.bitpay.com';
		network = Networks.testnet;
	} else {
		nodeURL = 'https://insight.bitpay.com/';
		network = Networks.livenet;
	}

	if (!bitcore.Address.isValid(publicKey, network)){
		throw 'publicKey Must be valid';
	}

	insight = new explorers.Insight(
	  nodeURL,
	  network
	);

	insight.getUnspentUtxos(publicKey, function(err, utxos) {
	  if (err) {
	    callback(err, null);
	  } else {
	    callback(null, utxos);
	  }
	});
}

/**
* Returns the total wallet value based on unspent transactions outputs (utxos)
* 
* @param {string} publicKey The public address to check for utxos 
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {number}
*/
function getWalletTotal(publicKey, testnet, callback) {
	var walletTotal = 0;

	getWalletUtxos(publicKey, testnet, function(err, utxos) {
		if (err) {
			callback(err, null);
		} else {
			utxos.forEach(function (element, index, array) {
				walletTotal += element.satoshis;
			});

			callback(null, walletTotal);
		}
	})
}

/**
* Returns a list of unspent transaction outputs (utxos) that will exceed
* the specified amount of satoshis
* 
* @param {array} inputs A list of utxos to fund the amount
* @param {number} amount Amount of satoshis that we need to reach
* @return {array}
*/
function selectUnspentInputs(inputs, amount) {
	var selected = [];



	return selected;
}

/**
* Builds a serialized transaction from one public address to another
* It only supports a single receiving address. 
*	Remaining satoshis minus transaction fees will be sent back to the sender's wallet
* 
* @param {array} utxos A list of Unspent transaction outputs (utxos)
* @param {integer} amount Amount of satoshis that will be sent to the receiving wallet
* @param {string} senderPublicAddress The wallet that will be used to return remaining satoshis
* @param {string} senderPrivateAddress The private key that will be used to sign utxos
* @param {string} receiverPublicAddress The wallet that will receive the specified amount
* @return {string} A serialized transaction
*/
function buildSimpleTransaction(utxos, amount, senderPublicAddress, senderPrivateAddress, receiverPublicAddress) {

	if (utxos.length === 0) {
		throw 'utxos length must be >= 1';
	}

	if (amount == 0) {
		throw 'amount must be greater than 0';
	}

	// We start creating the transaction
  var transaction = new bitcore.Transaction()
  	.from(utxos) // Adding unspent transactions to fund this transaction
  	.to(receiverPublicAddress, amount) // Specifying the receiving address and the amount
  	.change(senderPublicAddress) // Adding an address to receive remaining satoshis
  	.sign(senderPrivateAddress); // Signing the transaction with the senders private key

  if (transaction.inputAmount < transaction.outputAmount) {
  	throw 'Not enough inputs to fund transaction'
  }

  return transaction.serialize();
}

module.exports = {
	generateWallet: generateWallet,
	getWalletUnspent: getWalletUnspent,
	getWalletTotal: getWalletTotal
};