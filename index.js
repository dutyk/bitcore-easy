var bitcore = require('bitcore');
var explorers = require('bitcore-explorers');
var Networks = bitcore.Networks;

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
* @return {object} {publicKey: String, privateKey: String}
*/
function generateWallet(testnet) {
	var network = getNetwork(testnet);

	var privateKey = new bitcore.PrivateKey(network.networkData); // Creating a new PrivateKey for use on the testnet

	return {
		publicKey: privateKey.publicKey.toAddress().toString(),
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
function publicAddressIsValid(publicKey, testnet) {
	var network = getNetwork(testnet);

	return bitcore.Address.isValid(publicKey, network.networkData);
}

/**
* Checks if a private key is valid
* 
* @param {string} The private key
* @return {boolean} If valid or not
*/
function privateKeyisValid(privateKey) {
	return bitcore.PrivateKey.isValid(privateKey);
}

/**
* Returns a list of unspent transactions outputs (utxos) for the given public address
* 
* @param {string} publicKey The public address to check for utxos 
* @param {boolean} testnet Indicates if testnet or livenet will be used
* @return {array}
*/
function getWalletUtxos(publicKey, testnet, callback) {
	var network = getNetwork(testnet),
		insight = getInsight(testnet);

	if (!publicAddressIsValid(publicKey, network.networkData)){
		throw 'publicKey Must be valid';
	}

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
		throw 'utxos must be >= 1';
	}

	if (!amount || amount <= 0) {
		throw 'amount must be greater than 0';
	}

	if (!publicAddressIsValid(senderPublicAddress, testnet)) {
		throw 'senderPublicAddress must be a valid public address';
	}
	
	if (!publicAddressIsValid(receiverPublicAddress, testnet)) {
		throw 'receiverPublicAddress must be a valid public address';
	}

	if (!privateKeyisValid(senderPrivateKey)) {
		throw 'senderPrivateKey must be valid';
	}

	// We start creating the transaction
  var transaction = new bitcore.Transaction()
  	.from(utxos)
  	.to(receiverPublicAddress, amount) // Specifying the receiving address and the amount
  	.change(senderPublicAddress);

	// var currentIndex = 0;
	// while (transaction.inputAmount < transaction.outputAmount) {
	// 	var utxo = utxos[currentIndex];

	// 	transaction.from(utxo);
	// 	// transaction.addInput(new bitcore.Input(
	// 	// 	{
	// 	// 		output: new bitcore.Transaction.Output({
	//  //      script: utxo.script,
	//  //      satoshis: utxo.satoshis
	//  //    }),
	//  //    prevTxId: utxo.txId,
	//  //    outputIndex: utxo.outputIndex,
	//  //    script: bitcore.Script.empty()
	// 	// 	}
	// 	// ));

	// 	currentIndex++;

	// 	if (currentIndex === utxos.length) {
	// 		break;
	// 	}
	// }

  if (transaction.inputAmount < transaction.outputAmount) {
  	throw 'Not enough inputs to fund transaction';
  }

  // Signing the transaction with the senders private key
  transaction.sign(senderPrivateKey);

  if (transaction.isFullySigned()) {
  	return transaction.serialize();
  } else {
  	throw 'Transaction not fully signed';
  }
}

module.exports = {
	getNetwork: getNetwork,
	getInsight: getInsight,
	generateWallet: generateWallet,
	getWalletUtxos: getWalletUtxos,
	getWalletTotal: getWalletTotal,
	buildSimpleTransaction: buildSimpleTransaction
};