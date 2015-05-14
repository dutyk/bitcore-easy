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
	  validPrivateKey2 = '5J7JbCwxA36bKNhdySnjpP3EfEKHGZjDYR8Fr3piBZfM8VQNYjR';
	  invalidPrivateKey = '93Qw5WS8xm3MBvS7HPJ5FFQb5qqVjTqoGmtaBzBRdB2ybpWb123';
	  validPublicAddressUtxoCount = 5;
	  validPublicAddressSatoshis = 177770000;

	before(function(done) {
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
		done();
	});

	after(function (done) {
		Insight.prototype.getUnspentUtxos.restore();
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
		var wallet = BitcoreEasy.generateWallet();
		
		it('creates a wallet with a non empty public address', function () {
			wallet.should.have.property('publicAddress');
			wallet.publicAddress.should.be.a('string');
		});

		it('creates a wallet with a non empty private key', function () {
			wallet.should.have.property('privateKey');
			wallet.privateKey.should.be.a('string');
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
			}).to.throw('publicKey Must be valid');
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
			}).to.throw(BitcoreEasy.errors.PUBLIKEY_MUST_BE_VALID);
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
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
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
});