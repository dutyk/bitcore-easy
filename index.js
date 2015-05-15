var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');
var Networks = bitcore.Networks;

var errors = {
	PUBLIC_ADDRESS_MUST_BE_VALID: 'publicAddress Must be valid',
	NOT_ENOUGH_UTXOS: 'utxos must be >= 1',
	INVALID_AMOUNT: 'amount must be greater than 0',
	INVALID_SENDER_ADDRESS: 'senderPublicAddress must be a valid public address',
	INVALID_RECEIVER_ADDRESS: 'receiverPublicAddress must be a valid public address',
	INVALID_SENDER_PRIVATE_KEY: 'senderPrivateKey must be valid',
	NOT_ENOUGH_INPUTS: 'Not enough inputs to fund transaction',
	TRANSACTION_NOT_SIGNED: 'Transaction not fully signed',
	INVALID_TRANSACTION: "transaction must be valid",

};


function getNetwork(testnet) {
	var nodeURL = null,
		network = null;

	if (testnet) {
		nodeURL = 'https://test-insight.bitpay.com';
		network = Networks.testnet;
	} else {
		nodeURL = 'https://insight.bitpay.com/';
		network = Networks.livenet;
	}

	return {
		nodeURL: nodeURL,
		networkData: network
	};
}

function getInsight(testnet) {
	var network = getNetwork(testnet);

	return new explorers.Insight(
	  network.nodeURL,
	  network.networkData
	);
}

/**
* Generates a new Public and Private key pair
*
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @param {string} hashValue Value used to
* @return {object} {publicAddress: String, privateKey: String}
*/
function generateWallet(testnet, hashValue) {
	var network = getNetwork(testnet);
	var privateKey = null;

	if (hash) {
		var value = new Buffer(hashValue);
		var hash = bitcore.crypto.Hash.sha256(value);
		var bn = bitcore.crypto.BN.fromBuffer(hash);

		privateKey = new bitcore.PrivateKey(bn, network.networkData);
	} else {
		privateKey = new bitcore.PrivateKey(null, network.networkData);
	}

	return {
		publicAddress: privateKey.publicKey.toAddress().toString(),
		privateKey: privateKey.toString()
	};
}

/**
* Checks if a public address is valid
*
* @param {string} The public address
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {boolean} If valid or not
*/
function publicAddressIsValid(publicAddress, testnet) {
	var network = getNetwork(testnet);

	return bitcore.Address.isValid(publicAddress, network.networkData);
}

/**
* Checks if a private key is valid
*
* @param {string} The private key
* @return {boolean} If valid or not
*/
function privateKeyIsValid(privateKey) {
	return bitcore.PrivateKey.isValid(privateKey);
}

/**
* Returns a list of unspent transactions outputs (utxos) for the given public address
*
* @param {string} publicAddress The public address to check for utxos
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @param {function} callback Will be called when done. Signature function(err, data)
* @return {array}
*/
function getWalletUtxos(publicAddress, testnet, callback) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet);

	if (!publicAddressIsValid(publicAddress, network.networkData)){
		throw errors.PUBLIC_ADDRESS_MUST_BE_VALID;
	}

	insight.getUnspentUtxos(publicAddress, function(err, utxos) {
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
* @param {string} publicAddress The public address to check for utxos
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @param {function} callback Will be called when done. Signature function(err, data)
*/
function getWalletTotal(publicAddress, testnet, callback) {
	var walletTotal = 0;

	getWalletUtxos(publicAddress, testnet, function(err, utxos) {
		if (err) {
			callback(err, null);
		} else {
			utxos.forEach(function (element, index, array) {
				walletTotal += element.satoshis;
			});

			callback(null, walletTotal);
		}
	});
}

/**
* Builds a serialized transaction from one public address to another
* It only supports a single receiving address.
*	Remaining satoshis minus transaction fees will be sent back to the sender's wallet
*
* @param {array} utxos A list of Unspent transaction outputs (utxos)
* @param {integer} amount Amount of satoshis that will be sent to the receiving wallet
* @param {string} senderPublicAddress The wallet that will be used to return remaining satoshis
* @param {string} senderPrivateKey The private key that will be used to sign utxos
* @param {string} receiverPublicAddress The wallet that will receive the specified amount
* @return {string} A serialized transaction
*/
function buildSimpleTransaction(utxos, amount, senderPublicAddress, senderPrivateKey, receiverPublicAddress, testnet) {

	if (!utxos || utxos.length === 0) {
		throw errors.NOT_ENOUGH_UTXOS;
	}

	if (!amount || amount <= 0) {
		throw errors.INVALID_AMOUNT;
	}

	if (!publicAddressIsValid(senderPublicAddress, testnet)) {
		throw errors.INVALID_SENDER_ADDRESS;
	}

	if (!publicAddressIsValid(receiverPublicAddress, testnet)) {
		throw errors.INVALID_RECEIVER_ADDRESS;
	}

	if (!privateKeyIsValid(senderPrivateKey)) {
		throw errors.INVALID_SENDER_PRIVATE_KEY;
	}

	// We start creating the transaction
  var transaction = new bitcore.Transaction()
  	.to(receiverPublicAddress, amount) // Specifying the receiving address and the amount
  	.change(senderPublicAddress);

	var currentIndex = 0;
	while (transaction.inputAmount < transaction.outputAmount) {
		var utxo = utxos[currentIndex];
		transaction.from(utxo);

		currentIndex++;
		if (currentIndex === utxos.length) {
			break;
		}
	}

  if (transaction.inputAmount < transaction.outputAmount) {
  	throw errors.NOT_ENOUGH_INPUTS;
  }

  // Signing the transaction with the senders private key
  transaction.sign(senderPrivateKey);

  if (transaction.isFullySigned()) {
  	return transaction.serialize();
  } else {
  	throw errors.TRANSACTION_NOT_SIGNED;
  }
}

/**
* Sends a serialized transaction to the bitcoin network using bitpay's node
*
* @param {string} senderPublicAddress The wallet that will be used to return remaining satoshis
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @param {function} callback Will be called when done. Signature function(err, data)
*/
function broadcastTransaction(serializedTransaction, testnet, callback) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet),
		transaction = null;

		try {
			transaction = bitcore.Transaction(serializedTransaction);
		} catch (exception) {
			throw errors.INVALID_TRANSACTION;
		}

		if (transaction.verify() !== true) {
			throw errors.INVALID_TRANSACTION;
		}

		if (!transaction.isFullySigned()) {
			throw errors.TRANSACTION_NOT_SIGNED;
		}

		insight.broadcast(serializedTransaction, function (err, txid) {
		  if (err) {
		  	callback(err, null);
		  } else {
		  	callback(null, txid);
		  }
		});
}

/**
* Retrieves a transaction's information from the bitpay API
*
* @param {string} txid The transaction id you want to check
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @param {function} callback Will be called when done. Signature function(err, data)
*/
function getTransactionInfo(txid, testnet, callback) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet);

		insight.requestGet('/api/tx/' + txid, function (err, res, body) {
		  if (err) {
		  	callback(err, null);
		  } else {
		  	callback(null, JSON.parse(body));
		  }
		});
}

module.exports = {
	errors: errors,
	getNetwork: getNetwork,
	getInsight: getInsight,
	generateWallet: generateWallet,
	publicAddressIsValid: publicAddressIsValid,
	privateKeyIsValid: privateKeyIsValid,
	getWalletUtxos: getWalletUtxos,
	getWalletTotal: getWalletTotal,
	buildSimpleTransaction: buildSimpleTransaction,
	broadcastTransaction: broadcastTransaction
};
