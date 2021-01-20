// Imports
let request = require('request');

const COIN = 100000000; // Satoshis in Bitcoin
// Maincode
class WebAPI {
    constructor() {
        this.api = "https://blockstream.info";
        this.endpoint = "/api";
    }

    // Choose network, between the main-net or the test-net.
    NetworkSwitch(net) {
        if (net == "mainnet") {
            this.endpoint = "/api";
        }
        else if (net == "testnet") {
            this.endpoint = "/testnet/api";
        }
    }

    // Special Case: Accessing the last block.
    LastBlockHash() {
        let url = this.api + this.endpoint + "/blocks/tip/hash";
            return new Promise((resolve, reject) => {
                request(url, (err, res, body) => {
                    if (err) reject(err)
                    resolve(body);
                })
            })
    }

    BlockInfo(bhash) {
        // Access each block via hash, using an API call.
        let url = this.api + this.endpoint + "/block/" + bhash;
        return new Promise((resolve, reject) => {
            request(url, (err, res, body) => {
                // If there is an error, reject and show.
                if (err) reject(err)
                // If there is no error, access the information.
                let info = JSON.parse(body);            
                resolve(
                    {
                        bhash: info.id,
                        height: info.height,
                        timestamp: info.timestamp,
                        txno: info.tx_count,
                        bsize: info.size,
                        prevhash: info.previousblockhash
                    }
                )
            })
        })
    }

    // This returns an array of tx-ids for the block of given hash.
    BlockContent(bhash) {
        // Access each block via hash, using an API call.
        let url = this.api + this.endpoint + "/block/" + bhash + "/txids";
        return new Promise((resolve, reject) => {
            request(url, (err, res, body) => {
                // If there is an error, reject and show.
                if (err) reject(err)
                // If there is no error, access the information.
                let info = JSON.parse(body);            
                resolve(info)
            })
        })
    }

    AddressBalance(address) {
        // Access each block via hash, using an API call.
        let url = this.api + this.endpoint + "/address/" + address;
        return new Promise((resolve, reject) => {
            request(url, (err, res, body) => {
                // If there is an error, reject and show.
                if (err) reject(err)
                // If there is no error, access the information.
                let info = JSON.parse(body);
                // Compute balance and display in mBTC.
                let balance = (info.chain_stats.funded_txo_sum-info.chain_stats.spent_txo_sum)/COIN;
                resolve(balance*1000)   // in mBTC
            })
        })
    }

    // Views UTXOs in a TX, lists 
    LockScript(txhash) {
        let url = this.api + this.endpoint + "/tx/" + txhash;
        return new Promise((resolve, reject) => {
            request (url, (err, res, body) => {
                // If there is an error, reject and show.
                if (err) reject(err)
                // If there is no error, access the information.
                let info = JSON.parse(body);
                let InputsData = info.vin;
                let OutputsData = info.vout;
                let LSA = [];   // Lock-Script Array
                for (let x of OutputsData) {
                    LSA.push(x.scriptpubkey_asm)
                }
                resolve(LSA)
            })
        })
    }

    AddressUTXO(address) {
            return new Promise((resolve, reject) => {
            // Using a different API because EsploraAPI doesn't have a method for accessing the locking script.
            if (this.endpoint == "/api") {
                var url = "https://api.blockcypher.com/v1/btc/main/addrs/" + address + "?unspentOnly=true&includeScript=true";
            }
            else if (this.endpoint == "/testnet/api") {
                var url = "https://api.blockcypher.com/v1/btc/test3/addrs/" + address + "?unspentOnly=true&includeScript=true";
            }
            
            request(url, (err, res, body) => {
                // If there is an error, reject and show.
                if (err) reject(err);
                // If there is no error, access the information.
                let info = JSON.parse(body);
                let result = info.txrefs.map(utxo => {
                    return {
                        hash: utxo.tx_hash,
                        index: utxo.tx_output_n,
                        value: utxo.value,
                        script: utxo.script
                    };
                });
                resolve({data: result});
            })
        })
    }

    sendTx(data) {
        let url = this.api + this.endpoint + "/tx";
        return new Promise((resolve, reject) => {
            request.post({url: url, form: data.toString(16)}, (err, res, body) => {
                if (err) reject(err);
                resolve(body);
            })
        })
    }
}

module.exports = WebAPI;