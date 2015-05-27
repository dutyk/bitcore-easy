# bitcore-easy
A wrapper for the BitcoreJS library that makes it easier to work with bitcoin.

## Installation

```
npm install bitcore-easy --save
```

## Testing
Within the module's directory run:
```
npm test
```

## Usage
All functions that require server calls will return promises. Then you can use the result or catch the problem :)


### Generate a new testnet wallet
```javascript
var BitcoreEasy = require('bitcore-easy');
var wallet = BitcoreEasy.generateWallet(true);
console.log(wallet.publicKey);
console.log(wallet.privateKey);
```

### Generate a new wallet from a random hash
```javascript
var BitcoreEasy = require('bitcore-easy');
var wallet = BitcoreEasy.generateWallet(true, 'qwefiouasdhkfloiqweyfhalsdkfj');
console.log(wallet.publicKey);
console.log(wallet.privateKey);
```

### Check if a public address is valid
```javascript
var BitcoreEasy = require('bitcore-easy');
var result = BitcoreEasy.publicAddressIsValid('SOMEPUBLICADDRESS', true);
console.log(result);
```

### Check if a private key is valid
```javascript
var BitcoreEasy = require('bitcore-easy');
var result = BitcoreEasy.privateKeyIsValid('SOMEPRIVATEKEY');
console.log(result);
```

### Get a wallet's unspent transactions
```javascript
var BitcoreEasy = require('bitcore-easy');
BitcoreEasy.getWalletUtxos('SOMEPUBLICADDRESS', true)
  .then(function (utxos) {
    console.log(utxos);
  })
  .catch(function (error) {
    // something crappy happened
  });
```

### Get a wallet's total satoshis
```javascript
var BitcoreEasy = require('bitcore-easy');
BitcoreEasy.getWalletTotal('SOMEPUBLICADDRESS', true)
  .then(function(walletTotal) {
    console.log(walletTotal);
  })
  .catch(function(error) {
    // something junky happened
  });

```

### Build a simple one to one transaction and serialize it
```javascript
var BitcoreEasy = require('bitcore-easy');
var serializedTransaction = BitcoreEasy.buildSimpleTransaction(
    utxos, // Unspent obtained from BitcoreEasy.getWalletUtxos
    100000000, // Amount of satoshis to transfer
    'SENDERPUBLICADDRESS', // Sender public address (change will be returned here)
    'SENDERPRIVATEKEY', // Sender private key used to sign inputs
    'RECIPIENTPUBLICADDRESS', // Recipient's public address
    true // testnet or livenet
  );

```

### Broadcast a serialized transaction
```javascript
var BitcoreEasy = require('bitcore-easy');
BitcoreEasy
  .broadcastTransaction(validSerializedTransaction, true)
    .then(function (txid) {
      console.log(txid);
    })
    .then(function(error) {
      // something shoddy happened
    });

```

### Get a transaction's information
```javascript
var BitcoreEasy = require('bitcore-easy');
BitcoreEasy
  .getTransactionInfo(validTransactionId, true)
    .then(function (txData) {
      console.log(txData)
    })
    .catch(function(error) {
      // something nasty happened
    });
});

```

## Tests

```
npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.1.0 Initial release

## License

ISC License (ISC)

Copyright (c) 2015, Alejandro Carlos

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
