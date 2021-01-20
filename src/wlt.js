var WebAPI = require('./api');
var keys = require('./key');
var tx = require('./txs');
const COIN = 100000000; // Satoshis in Bitcoin

class BTCWallet {
    constructor() {
        this.api = new WebAPI();
        this.wallet = {};
    }

    ShowWallet() {
        return this.wallet;
    }

    ShowBalance() {
        return this.api.AddressBalance(this.wallet.address);
    }

    NewWallet(net="mainnet", key=0) {
        // When importing key, determine network automatically
        if(keys.getNetworkFromKey(key) !== "unknown") {
            net = keys.getNetworkFromKey(key);
        }
        this.api.NetworkSwitch(net);
        this.wallet = keys.createWallet(net, key);

        return new Promise((resolve, reject) => {
            resolve(this.wallet);
        });
    }

    // Test PrivKey1 = "cNwmkgib65mAiuSsicWyTxBxUYtSNsieg6ERwFvnoBjGzKV8mJjV"
    // Test PrivKey2 = "cUeqiXN1UJiXcEcmBgXm87U97uD1pwBv23LZYaNuUdkffwvVDX8P"
    SendBitcoin(amount, toAddr) {
        amount = (amount*COIN)/1; // convert BTC -> Satoshis

        return new Promise((resolve, reject) => {
            this.api.AddressUTXO(this.wallet.address).then(utxo => {
                return tx.create(utxo, amount, toAddr, this.wallet);
            }).then(tx => {
                return this.api.sendTx(tx);
            }).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }
}

module.exports = new BTCWallet();