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
			.yields(validTransactionId);

		done();
	});

	after(function (done) {
		Insight.prototype.getUnspentUtxos.restore();
		Insight.prototype.broadcast.restore();
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
				.broadcastTransaction(invalidSerializedTransaction, true, function (err, txid) {

				});
		});
	});
});
