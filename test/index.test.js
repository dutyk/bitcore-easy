var 
	should = require('chai').should(),
  bitcoreEasy = require('../index'),
  generateWallet = bitcoreEasy.generateWallet;

describe('#generateWallet', function() {
	var wallet = generateWallet();
	console.log(wallet);
	
	it('creates a wallet with a non empty public key', function () {
		wallet.should.have.property('publicKey');
		wallet.publicKey.should.be.a('string');
	});

	it('creates a wallet with a non empty private key', function () {
		wallet.should.have.property('privateKey');
		wallet.privateKey.should.be.a('string');
	});
});