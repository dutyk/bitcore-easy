var 
	chai = require('chai'),
	should = require('chai').should(),
	expect = require('chai').expect,
	sinon = require('sinon'),
  bEasy = require('../index'),
  generateWallet = bEasy.generateWallet,
  getWalletUnspent = bEasy.getWalletUnspent,
  getWalletTotal = bEasy.getWalletTotal;

describe('bitcore-easy', function (){
	var Insight = require('bitcore-explorers').Insight;
	var bitcore = require('bitcore');

	before(function(done) {
		sinon
			.stub(Insight.prototype, 'getUnspentUtxos')
			.yields(
				null, 
				[	new bitcore.Transaction.UnspentOutput({
					  "txid" : "a0a08e397203df68392ee95b3f08b0b3b3e2401410a38d46ae0874f74846f2e9",
					  "vout" : 0,
					  "address" : "mgJT8iegL4f9NCgQFeFyfvnSw1Yj4M5Woi",
					  "scriptPubKey" : "76a914089acaba6af8b2b4fb4bed3b747ab1e4e60b496588ac",
					  "amount" : 0.00070000
					}),
					new bitcore.Transaction.UnspentOutput({
					  "txId" : "a0a08e397203df68392ee95b3f08b0b3b3e2401410a38d46ae0874f74846f2e9",
					  "outputIndex" : 0,
					  "address" : "mgJT8iegL4f9NCgQFeFyfvnSw1Yj4M5Woi",
					  "script" : "76a914089acaba6af8b2b4fb4bed3b747ab1e4e60b496588ac",
					  "satoshis" : 70000
					})
				]
			);
		done();
	});

	after(function (done) {
		Insight.prototype.getUnspentUtxos.restore();
		done();
	});

	describe('#generateWallet', function() {
		var wallet = generateWallet();
		
		it('creates a wallet with a non empty public key', function () {
			wallet.should.have.property('publicKey');
			wallet.publicKey.should.be.a('string');
		});

		it('creates a wallet with a non empty private key', function () {
			wallet.should.have.property('privateKey');
			wallet.privateKey.should.be.a('string');
		});
	});

	describe('#getWalletUtxos', function () {
		it('excepts with an invalid public address', function () {
			var invalidAddress = 'adsfjal;ksdfjkl;ajdfl;';

			chai.expect(function(){
				getWalletUtxos(invalidAddress, true);
			}).to.throw('publicKey Must be valid');
		});

		it('returns a list of unspent transactions', function(done) {
			var validAddress = 'mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr';

			getWalletUtxos(validAddress, true, function(err, utxos) {
				expect(err).to.be.null;
				utxos.should.not.be.empty;
				utxos.should.have.length(2);
				done();
			});

		});
	});

	describe('#getWalletTotal', function (done) {
		it('excepts with an invalid public address', function () {
			var invalidAddress = 'adsfjal;ksdfjkl;ajdfl;';

			chai.expect(function(){
				getWalletTotal(invalidAddress, true);
			}).to.throw('publicKey Must be valid');
		});

		it('returns a numeric wallet value equaling the sum of satoshis from utxos', function(done) {
			var validAddress = 'mfeStRvHZeaEDFL1jascHdhKdMFT86KFvr';

			getWalletTotal(validAddress, true, function(err, walletTotal) {
				expect(err).to.be.null;
				walletTotal.should.be.a('number');
				walletTotal.should.equal(140000);
				done();
			});

		});
	});
});