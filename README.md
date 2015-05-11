# bitcore-easy
A wrapper for the BitcoreJS library that makes it easier to work with bitcoin.

# Installation

  npm install bitcore-easy --save
  
# Usage

  var bEasy = require('bitcore-easy');
  
  var wallet= bEasy.generateWallet();
  console.log(wallet.publicKey);
  console.log(wallet.privateKey);
