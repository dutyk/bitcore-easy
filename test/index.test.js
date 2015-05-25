/*jshint expr: true*/

var
	chai = require('chai'),
	should = require('chai').should(),
	expect = require('chai').expect,
	sinon = require('sinon'),
  BitcoreEasy = require('../index');

describe('bitcore-easy', function (){
	var Insight = require('bitcore-explorers').Insight,
	  bitcore = require('bitcore'),
	  validPublicAddress = 'mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr',
	  validPublicAddress2 = '2MzEWqWAuxQp1RHXn7r9jnwhNBkeWFPPzTz',
	  invalidPublicAddress = 'adsfjal;ksdfjkl;ajdfl;',
	  validPrivateKey = '93Qw5WS8xm3MBvS7HPJ5FFQb5qqVjTqoGmtaBzBsGiRdB2ybpWb',
	  validPrivateKey2 = '5J7JbCwxA36bKNhdySnjpP3EfEKHGZjDYR8Fr3piBZfM8VQNYjR',
	  invalidPrivateKey = '93Qw5WS8xm3MBvS7HPJ5FFQb5qqVjTqoGmtaBzBRdB2ybpWb123',
	  validPublicAddressUtxoCount = 5,
	  validPublicAddressSatoshis = 177770000,
	  validTransactionId = 'eee2073abb3ac431fa9c5eeaac64f5c1cc05752de8b6febe4e705322d06fdbed',
	  validSerializedTransaction = "0100000004919d204ca30f71d37c320fe844712b2bd48f1f0fdc7939d8126a212523a3837e010000008a47304402200ad96af26a4642a564736c69da4b051da6d34a717d725c5b7bf4a66e9cc60b250220116f5171fa9f65aa1f69f13356b37af6c85dcb32a20bfaacd75f594b360dfc58014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709afffffffff333fc81895e690f84a7a25b50336639bba969459675f679a168a86b73057980010000008a47304402207349159a086713955ae52d00d954fd219e313c510793f9c7ea3103faaeaf1cf2022078a13481032dbe5601a5c98a9d7b716f57ce8c72d24deab6014071d619624d3e014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709affffffffeddb6fd02253704ebefeb6e82d7505ccc1f564acea5e9cfa31c43abb3a07e2ee000000008a4730440220757e89f6811f4cb0a4be88a11632425a8fa5ca5a22534c10d2be2f23b7573fa5022042e5baeffd092232d42bcaaec693130c05005320e7f8b2ba6664157c90d21206014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709affffffff06bf8b469178c89775fc133e201534474fbce2464cf758d9e17c50f1a524158c010000008a473044022034b92ad6a8bd8c90e6146d57333a15ff18ace02911df25d04ebe5e2277c5579702201b3b4d9c0bdf37a23c69eb749549743fb68030e75ccf598f91efb72c52037611014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709affffffff0280778e060000000017a9144ca6876f4f52954defb430dd65b814e6d55663448740a4bd03000000001976a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac00000000",
	  invalidSerializedTransaction = "0100000004919d204ca30f71d37c320fe844712b2bd48f1f0fdc7939d8126a212528a3837e010000008a47j04402200ad96af26a4642a564736c69da4b051da6d34a717d725c5b7bf4a66e9cc60b250220116f5171fa9f65aa1f69f13356b37af6c85dcb32a20bfaacd75f594b360dfc58014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709afffffffff333fc81895e690f84a7a25b50336639bba969459675f679a168a86b73057980010000008a47304402207349159a086713955ae52d00d954fd219e313c510793f9c7ea3103faaeaf1cf2022078a13481032dbe5601a5c98a9d7b716f57ce8c72d24deab6014071d619624d3e014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709affffffffeddb6fd02253704ebefeb6e82d7505ccc1f564acea5e9cfa31c43abb3a07e2ee000000008a4730440220757e89f6811f4cb0a4be88a11632425a8fa5ca5a22534c10d2be2f23b7573fa5022042e5baeffd092232d42bcaaec693130c05005320e7f8b2ba6664157c90d21206014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709affffffff06bf8b469178c89775fc133e201534474fbce2464cf758d9e17c50f1a524158c010000008a473044022034b92ad6a8bd8c90e6146d57333a15ff18ace02911df25d04ebe5e2277c5579702201b3b4d9c0bdf37a23c69eb749549743fb68030e75ccf598f91efb72c52037611014104beec4842026e3d968f2d80fb7ca20e37b35ad70fbdd66775b5c97e0f3c1130caa1ca0b2ea099df7448dfa3a6000357a72a066ec0c6ff28eb16a9fc83f59b709affffffff0280778e060000000017a9144ca6876f4f52954defb430dd65b814e6d55663448740a4bd03000000001976a914016ac79b56cc72a7cef8ab86b85bc60df45a2e3688ac00000000";
		transactionData = '{"txid":"eee2073abb3ac431fa9c5eeaac64f5c1cc05752de8b6febe4e705322d06fdbed","version":1,"locktime":0,"vin":[{"txid":"7e83a32325216a12d83979dc0f1f8fd42b2b7144e80f327cd3710fa34c209d91","vout":0,"scriptSig":{"asm":"0 304402203740418e972d2f78fe6625635cab53e9ad8c273dd1e9b42d1acb4454cfd95bdd022014f9ba8d4334feaa3e7e1c1d8d9efc6423681e76b667dae6c3620326af0dd1ee01 304402205a39252d27a1b5bd9fe4093cd852b460cdca5d9c29aeb5f27c1213c024dbcbd60220567fd98bd671fe2dd37cb285cfc985308e8c1b2b101a52ed8ebc620d6f59af7f01 5221020aca07670b678591e9d8676615eccd3f1e563a38acc754c53955efd97f97e0e221028a1c96eade44630aad894e74398b2318a1ed3c25097528ac5a53fd297a2f49c12103c34268472afc90aada71a2e86db87b09304d5060a54500c34272efbbee50838853ae","hex":"0047304402203740418e972d2f78fe6625635cab53e9ad8c273dd1e9b42d1acb4454cfd95bdd022014f9ba8d4334feaa3e7e1c1d8d9efc6423681e76b667dae6c3620326af0dd1ee0147304402205a39252d27a1b5bd9fe4093cd852b460cdca5d9c29aeb5f27c1213c024dbcbd60220567fd98bd671fe2dd37cb285cfc985308e8c1b2b101a52ed8ebc620d6f59af7f014c695221020aca07670b678591e9d8676615eccd3f1e563a38acc754c53955efd97f97e0e221028a1c96eade44630aad894e74398b2318a1ed3c25097528ac5a53fd297a2f49c12103c34268472afc90aada71a2e86db87b09304d5060a54500c34272efbbee50838853ae"},"sequence":4294967295,"n":0,"addr":"2MwELoDaW1sK66fGpKc3oCiTyvANUG5YiVx","valueSat":23970000,"value":0.2397,"doubleSpentTxID":null}],"vout":[{"value":"0.15000000","n":0,"scriptPubKey":{"asm":"OP_DUP OP_HASH160 016ac79b56cc72a7cef8ab86b85bc606f45a2e36 OP_EQUALVERIFY OP_CHECKSIG","hex":"76a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac","reqSigs":1,"type":"pubkeyhash","addresses":["mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr"]}},{"value":"0.08960000","n":1,"scriptPubKey":{"asm":"OP_HASH160 91cac8b6b74d2f2bad3168e0a757e261994c06af OP_EQUAL","hex":"a91491cac8b6b74d2f2bad3168e0a757e261994c06af87","reqSigs":1,"type":"scripthash","addresses":["2N6Y6tnGfGmTt2BVaUd9YtQrpTW1FSxEEzJ"]}}],"blockhash":"000000000816fca92ab655c9efaca63bcbdc95d631b408ead9fcf1459910e284","confirmations":30842,"time":1431630687,"blocktime":1431630687,"valueOut":0.2396,"size":369,"valueIn":0.2397,"fees":0.0001}';

	before(function (done) {
		sinon
			.stub(Insight.prototype, 'getUnspentUtxos')
			.yields(
				null,
				[	new bitcore.Transaction.UnspentOutput.fromObject({
						"address":"mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr",
					  "txid":"7e83a32325216a12d83979dc0f1f8fd42b2b7144e80f327cd3710fa34c209d91",
					  "vout":1,
					  "scriptPubKey":"76a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac",
					  "amount":0.5
					}),
					new bitcore.Transaction.UnspentOutput.fromObject({
						"address":"mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr",
					  "txid":"807905736ba868a179f675964569a9bb396633505ba2a7840f695e8981fc33f3",
					  "vout":1,
					  "scriptPubKey":"76a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac",
					  "amount":0.2
					}),
					new bitcore.Transaction.UnspentOutput.fromObject({
						"address":"mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr",
					  "txid":"eee2073abb3ac431fa9c5eeaac64f5c1cc05752de8b6febe4e705322d06fdbed",
					  "vout":0,
					  "scriptPubKey":"76a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac",
					  "amount":0.15
					}),
					new bitcore.Transaction.UnspentOutput.fromObject({
						"address":"mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr",
					  "txid":"8c1524a5f1507ce1d958f74c46e2bc4f473415203e13fc7597c87891468bbf06",
					  "vout":1,
					  "scriptPubKey":"76a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac",
					  "amount":0.8777
					}),
					new bitcore.Transaction.UnspentOutput.fromObject({
						"address":"mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr",
					  "txid":"70657bd8a67018d44053731255bb1a11cb0b20c15a2413c77f04d2ee7ca05c6d",
					  "vout":0,
					  "scriptPubKey":"76a914016ac79b56cc72a7cef8ab86b85bc606f45a2e3688ac",
					  "amount":0.05
					})
				]
			);

		sinon
			.stub(Insight.prototype, 'broadcast')
			.yields(null, validTransactionId);

		sinon
			.stub(Insight.prototype, 'requestGet')
			.withArgs('/api/tx/' + validTransactionId)
			.yields(null, '', transactionData);

		done();
	});

	after(function (done) {
		Insight.prototype.getUnspentUtxos.restore();
		Insight.prototype.broadcast.restore();
		Insight.prototype.requestGet.restore();
		done();
	});

	describe('#getNetwork', function() {
		var network = BitcoreEasy.getNetwork(true);

		it('returns an object with nodeURL and networkData', function() {
			network.should.have.property('nodeURL');
			network.should.have.property('networkData');
		});
	});

	describe('#getInsight', function() {
		var insight = BitcoreEasy.getInsight(true);

		it('returns an Insight instance', function() {
			insight.should.not.be.null;
		});
	});

	describe('#generateWallet', function() {
		it('creates a wallet with a non empty public address', function () {
			var wallet = BitcoreEasy.generateWallet(true);
			wallet.should.have.property('publicAddress');
			wallet.publicAddress.should.be.a('string');
		});

		it('creates a wallet with a non empty private key', function () {
			var wallet = BitcoreEasy.generateWallet(true);
			wallet.should.have.property('privateKey');
			wallet.privateKey.should.be.a('string');
		});

		it('creates a wallet from a hash value', function () {
			var wallet = BitcoreEasy.generateWallet(true, 'asdfqoweiufaksdlfjaliuioj');
			wallet.should.have.property('privateKey');
			wallet.privateKey.should.be.a('string');
		});

		it('creates a valid testnet wallet', function () {
			var wallet = BitcoreEasy.generateWallet(true);
			var valid = BitcoreEasy.publicAddressIsValid(wallet.publicAddress, true);
			var notValid = BitcoreEasy.publicAddressIsValid(wallet.publicAddress, false);

			valid.should.be.ok;
			notValid.should.not.be.ok;
		});

		it('creates a valid livenet wallet', function () {
			var wallet = BitcoreEasy.generateWallet(false);
			var valid = BitcoreEasy.publicAddressIsValid(wallet.publicAddress, false);
			var notValid = BitcoreEasy.publicAddressIsValid(wallet.publicAddress, true);

			valid.should.be.ok;
			notValid.should.not.be.ok;
		});
	});

	describe('#publicAddressIsValid', function () {
		it('return false when an invalid address is provided', function () {
			BitcoreEasy.publicAddressIsValid(invalidPublicAddress, true).should.be.false;
		});

		it('return true when an valid address is provided', function () {
			BitcoreEasy.publicAddressIsValid(validPublicAddress, true).should.be.ok;
		});
	});

	describe('#privateKeyIsValid', function () {
		it('return false when an invalid address is provided', function () {
			BitcoreEasy.privateKeyIsValid(invalidPrivateKey).should.be.false;
		});

		it('return true when an valid address is provided', function () {
			BitcoreEasy.privateKeyIsValid(validPrivateKey).should.be.ok;
		});
	});

	describe('#getWalletUtxos', function () {
		it('excepts with an invalid public address', function () {
			chai.expect(function(){
				BitcoreEasy.getWalletUtxos(invalidPublicAddress, true);
			}).to.throw(BitcoreEasy.errors.PUBLIC_ADDRESS_MUST_BE_VALID);
		});

		it('returns a list of unspent transactions', function(done) {
			BitcoreEasy.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
				expect(err).to.be.null;
				utxos.should.not.be.empty;
				utxos.should.have.length(validPublicAddressUtxoCount);
				done();
			});

		});
	});

	describe('#getWalletTotal', function (done) {
		it('excepts with an invalid public address', function () {
			expect(function(){
				BitcoreEasy.getWalletTotal(invalidPublicAddress, true);
			}).to.throw(BitcoreEasy.errors.PUBLIC_ADDRESS_MUST_BE_VALID);
		});

		it('returns a numeric wallet value equaling the sum of satoshis from utxos', function(done) {
			BitcoreEasy.getWalletTotal(validPublicAddress, true, function(err, walletTotal) {
				expect(err).to.be.null;
				walletTotal.should.be.a('number');
				walletTotal.should.equal(validPublicAddressSatoshis);
				done();
			});

		});
	});

	describe('#buildSimpleTransaction', function (done) {
		it('excepts if an empty list of utxos is given', function () {
			expect(function () {
				BitcoreEasy
					.buildSimpleTransaction(
						[],
						null,
						null,
						null,
						null,
						true
					);
			}).to.throw(BitcoreEasy.errors.NOT_ENOUGH_UTXOS);
		});

		it('excepts if a zero value amount is given', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						expect(function () {
							BitcoreEasy
								.buildSimpleTransaction(
									utxos,
									0,
									null,
									null,
									null,
									true
								);
						}).to.throw(BitcoreEasy.errors.INVALID_AMOUNT);

						done();
				});
		});

		it('excepts if an invalid senderPublicAddress is provided', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						expect(function () {
							BitcoreEasy
								.buildSimpleTransaction(
									utxos,
									1000,
									invalidPublicAddress,
									validPrivateKey,
									validPublicAddress,
									true
								);
						}).to.throw(BitcoreEasy.errors.INVALID_SENDER_ADDRESS);

						done();
				});
		});

		it('excepts if an invalid receiverPublicAddress is provided', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						expect(function () {
							BitcoreEasy
								.buildSimpleTransaction(
									utxos,
									10000,
									validPublicAddress,
									validPrivateKey,
									invalidPublicAddress,
									true
								);
						}).to.throw(BitcoreEasy.errors.INVALID_RECEIVER_ADDRESS);

						done();
				});
		});

		it('excepts if an invalid senderPrivateKey is provided', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						expect(function () {
							BitcoreEasy
								.buildSimpleTransaction(
									utxos,
									10000,
									validPublicAddress,
									invalidPrivateKey,
									validPublicAddress,
									true
								);
						}).to.throw(BitcoreEasy.errors.INVALID_SENDER_PRIVATE_KEY);

						done();
				});
		});

		it('excepts if not enough satoshis are available in utxos', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						expect(function () {
							BitcoreEasy.buildSimpleTransaction(
								utxos,
								1000000000,
								validPublicAddress,
								validPrivateKey,
								validPublicAddress2,
								true
							);
						}).to.throw(BitcoreEasy.errors.NOT_ENOUGH_INPUTS);

						done();
				});
		});

		it('excepts if inputs are not signed', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						expect(function () {
							BitcoreEasy.buildSimpleTransaction(
								utxos,
								100000000,
								validPublicAddress,
								validPrivateKey2,
								validPublicAddress2,
								true
							);
						}).to.throw(BitcoreEasy.errors.TRANSACTION_NOT_SIGNED);

						done();
				});
		});

		it('returns a valid serialized transaction', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function (err, utxos) {
						var transaction = BitcoreEasy.buildSimpleTransaction(
								utxos,
								100000000,
								validPublicAddress,
								validPrivateKey,
								validPublicAddress2,
								true
							);
						transaction.should.be.ok;
						transaction.should.be.a('string');
						done();
				});
		});
	});

	describe('#broadcastTransaction', function() {
		it('throws an error if an invalid serliazed transaction is passed', function() {
			expect(function () {
				BitcoreEasy
					.broadcastTransaction(invalidSerializedTransaction, true, function (err, txid) {});
			}).to.throw(BitcoreEasy.errors.INVALID_TRANSACTION);
		});

		it('returns a valid transaction id', function (done) {
			BitcoreEasy
				.broadcastTransaction(validSerializedTransaction, true, function (err, txid) {
					expect(err).to.be.null;
					txid.should.be.a('string');
					done();
				});
		});
	});

	describe('#getTransactionInfo', function() {
		it('throws an error if an invalid txid is provided', function() {
			expect(function () {
				BitcoreEasy
					.getTransactionInfo(null, true, function (err, data) {});
			}).to.throw(BitcoreEasy.errors.TRANSACTION_ID_MUST_BE_PRESENT);
		});

		it('returns a valid hash with transaction information', function(done) {
			BitcoreEasy
				.getTransactionInfo(validTransactionId, true, function (err, data) {
					data.should.have.property('txid');
					data.should.have.property('vin');
					data.should.have.property('vout');
					data.should.have.property('blockhash');
					data.should.have.property('confirmations');
					data.should.have.property('time');
					data.should.have.property('blocktime');
					data.should.have.property('valueOut');
					data.should.have.property('size');
					data.should.have.property('valueIn');
					data.should.have.property('fees');

					done();
				});
		});
	});
});
