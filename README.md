# bitcore-easy
A wrapper for the BitcoreJS library that makes it easier to work with bitcoin.

# Installation

  npm install bitcore-easy --save

# Testing

	npm test

# Usage

  var BitcoreEasy = require('bitcore-easy');

  # Generate a new wallet
    var wallet= BitcoreEasy.generateWallet();
    console.log(wallet.publicKey);
    console.log(wallet.privateKey);
