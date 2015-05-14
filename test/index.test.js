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
	  invalidPublicAddress = 'adsfjal;ksdfjkl;ajdfl;',
	  validPrivateKey = '93Qw5WS8xm3MBvS7HPJ5FFQb5qqVjTqoGmtaBzBsGiRdB2ybpWb',
	  invalidPrivateKey = '93Qw5WS8xm3MBvS7HPJ5FFQb5qqVjTqoGmtaBzBRdB2ybpWb123';

	before(function(done) {
		sinon
			.stub(Insight.prototype, 'getUnspentUtxos')
			.yields(
				null, 
				[	new bitcore.Transaction.UnspentOutput({
						"address":"2MzEWqWAuxQp1RHXn7r9jnwhNBkeWFPPzTz",
						"txid":"8c1524a5f1507ce1d958f74c46e2bc4f473415203e13fc7597c87891468bbf06",
						"vout":0,
						"scriptPubKey":"a9144ca6876f4f52954defb430dd65b814e6d556634487",
						"amount":0.011
					}),
					new bitcore.Transaction.UnspentOutput({
						"address":"2MzEWqWAuxQp1RHXn7r9jnwhNBkeWFPPzTz",
						"txid":"301fcbf89a56244f513e1edfd06e6c8568c615e752b1cbac765c96c7017850ef",
						"vout":0,
						"scriptPubKey":"a9144ca6876f4f52954defb430dd65b814e6d556634487",
						"amount":0.011
					}),
					new bitcore.Transaction.UnspentOutput({
						"address":"2MzEWqWAuxQp1RHXn7r9jnwhNBkeWFPPzTz",
						"txid":"70657bd8a67018d44053731255bb1a11cb0b20c15a2413c77f04d2ee7ca05c6d",
						"vout":1,
						"scriptPubKey":"a9144ca6876f4f52954defb430dd65b814e6d556634487",
						"amount":0.9399
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
		
		it('creates a wallet with a non empty public key', function () {
			wallet.should.have.property('publicKey');
			wallet.publicKey.should.be.a('string');
		});

		it('creates a wallet with a non empty private key', function () {
			wallet.should.have.property('privateKey');
			wallet.privateKey.should.be.a('string');
		});
	});

	describe('#publicAddressIsValid', function () {
		var validAddress = 

		it('return false when an invalid address is provided', function () {

		});

		it('return true when an invalid address is provided', function () {
			
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
				utxos.should.have.length(3);
				done();
			});

		});
	});

	describe('#getWalletTotal', function (done) {
		it('excepts with an invalid public address', function () {
			expect(function(){
				BitcoreEasy.getWalletTotal(invalidPublicAddress, true);
			}).to.throw('publicKey Must be valid');
		});

		it('returns a numeric wallet value equaling the sum of satoshis from utxos', function(done) {
			BitcoreEasy.getWalletTotal(validPublicAddress, true, function(err, walletTotal) {
				expect(err).to.be.null;
				walletTotal.should.be.a('number');
				walletTotal.should.equal(96190000);
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
			}).to.throw('utxos must be >= 1');
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
						}).to.throw('amount must be greater than 0');

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
						}).to.throw('senderPublicAddress must be a valid public address');

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
						}).to.throw('receiverPublicAddress must be a valid public address');

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
						}).to.throw('senderPrivateKey must be valid');

						done();
				});
		});

		it('returns a valid serialized transaction', function (done) {
			BitcoreEasy
				.getWalletUtxos(validPublicAddress, true, function(err, utxos) {
						var transaction = BitcoreEasy.buildSimpleTransaction(
								utxos, 
								100000, 
								validPublicAddress,
								validPrivateKey,
								validPublicAddress,
								true
							);

						transaction.should.be.ok;
						transaction.should.be.a('string');
						done();
				});
		});
		
	});
});