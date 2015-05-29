var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');
var Networks = bitcore.Networks;
var Promise = require('es6-promise').Promise;
var _ = require('lodash');

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
	TRANSACTION_ID_MUST_BE_PRESENT: 'transaction id must be present'
};

/**
* Returns the URL and network data for the specified network
*
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {object} {nodeURL: String, network: object}
*/
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

/**
* Returns an bitcore-explorers Insight instance
*
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {Insight} An instance of bitcore-explorers Insight
*/
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
* @return {Promise} Returns a Promise that resolves with an array of utxos
*/
function getWalletUtxos(publicAddress, testnet) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet);

	if (!publicAddressIsValid(publicAddress, network.networkData)){
		throw errors.PUBLIC_ADDRESS_MUST_BE_VALID;
	}

	return new Promise(function(resolve, reject){
		insight.getUnspentUtxos(publicAddress, function(err, utxos) {
		  if (err) {
				reject(err);
		  } else {
				resolve(utxos);
		  }
		});
	});
}

function getWalletInfo(publicAddress, testnet, includeTx) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet),
		txInclusion = '';

		if (!publicAddressIsValid(publicAddress, network.networkData)){
			throw errors.PUBLIC_ADDRESS_MUST_BE_VALID;
		}

		if (!includeTx) {
			txInclusion = '?noTxList=1';
		}

		return new Promise(function(resolve, reject) {
			insight.requestGet('/api/addr/' + publicAddress + txInclusion, function (err, res, body) {
			  if (err) {
			  	reject(err);
			  } else {
			  	resolve(JSON.parse(body));
			  }
			});
		});
}

/**
* Returns the total wallet value based on unspent transactions outputs (utxos)
*
* @param {string} publicAddress The public address to check for utxos
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @param {Promise} A promise that resolves with the total on the wallet
*/
function getWalletTotal(publicAddress, testnet) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet),
		walletTotal = 0;

	if (!publicAddressIsValid(publicAddress, network.networkData)){
		throw errors.PUBLIC_ADDRESS_MUST_BE_VALID;
	}

	return new Promise(function(resolve, reject) {
		getWalletUtxos(publicAddress, testnet)
			.then(function(utxos) {
				utxos.forEach(function (element, index, array) {
					walletTotal += element.satoshis;
				});

				resolve(walletTotal);
			})
			.catch(function(error) {

			});
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
* @param {boolean} testnet Indicated if testnext or livenet will be used
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
* @param {function} callback Will be called when done. Signature function(err, txData)
*/
function getTransactionInfo(txid, testnet) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet);

		if (txid === undefined || txid === null || !txid) {
			throw errors.TRANSACTION_ID_MUST_BE_PRESENT;
		}

		return new Promise(function(resolve, reject) {
			insight.requestGet('/api/tx/' + txid, function (err, res, body) {
			  if (err) {
			  	reject(err);
			  } else {
			  	resolve(JSON.parse(body));
			  }
			});
		})
		.catch(console.log.bind(console));
}

module.exports = {
	bitcore: bitcore,
	explorers: explorers,
	errors: errors,
	getNetwork: getNetwork,
	getInsight: getInsight,
	generateWallet: generateWallet,
	publicAddressIsValid: publicAddressIsValid,
	privateKeyIsValid: privateKeyIsValid,
	getWalletUtxos: getWalletUtxos,
	getWalletTotal: getWalletTotal,
	buildSimpleTransaction: buildSimpleTransaction,
	broadcastTransaction: broadcastTransaction,
	getTransactionInfo: getTransactionInfo
};
