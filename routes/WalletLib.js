const bip39 = require('bip39');
const bip32 = require('bip32');
const ethUtil = require('ethereumjs-util');
const BN = require('ethereumjs-util').BN;
const secp256k1 = require('secp256k1');
var keyVaultLib = require('./keyVaultLib');

module.exports.generate = () => {
    let mnemonic = bip39.generateMnemonic();
    // console.log(mnemonic);
    return mnemonic;
}
let mnemonic = bip39.generateMnemonic();
// console.log(mnemonic);

let entropy = bip39.mnemonicToEntropy(mnemonic);
// console.log(entropy);

let entropyBn = new BN(entropy, 'hex');
// console.log(entropyBn.toString(2));

let mnemonictoo = bip39.entropyToMnemonic(entropy);
// console.log(mnemonictoo);

let seed = bip39.mnemonicToSeedSync(mnemonic);
// console.log(seed.toString('hex'));

let node = bip32.fromSeed(seed);
let parents = node.derivePath("m/44'/60'/0'/0/0");

let startIndex = 0;
let endIndex = 1;

for (let i = startIndex; i < endIndex; i++) {
    // let privateKeyStr = parents.derive(i).privateKey.toString('hex');
    // console.log(privateKeyStr);
    let publicKey = parents.derive(i).publicKey;

    // console.log(publicKey.toString('hex'));
    // console.log(ethUtil.importPublic(parents.derive(i).publicKey).toString('hex'));
    let unCompressedPubKey = ethUtil.importPublic(publicKey);

    let pubX = ethUtil.bufferToHex(unCompressedPubKey.slice(0, 32));

    let pubY = ethUtil.bufferToHex(unCompressedPubKey.slice(32));
    

    // console.log(unCompressedPubKey.toString('hex'));
    let address = ethUtil.bufferToHex(ethUtil.pubToAddress(unCompressedPubKey));

    // console.log(address);
}


/**
 * @param {string} mnemonic
 * @param {string} path
 * @returns {object} {privateKey & pubKey} : Promise
 */
module.exports.getPairKey = (mnemonic, path) => {
    let seed = bip39.mnemonicToSeedSync(mnemonic);

    let node = bip32.fromSeed(seed);
    let child = node.derivePath(path);
    let privateKey = child.privateKey;
    let publicKey = child.publicKey;
    let unCompressedPubKey = ethUtil.importPublic(publicKey);
    let pubX = unCompressedPubKey.slice(0, 32);
    let pubY = unCompressedPubKey.slice(32);
    // console.log(publicKey.toString('hex'));
    return {
        privateKey,
        pubX,
        pubY
    }
}


/**
 * @param {string} unCompressedPubKey
 * @returns {object} {address} : Promise
 */
module.exports.getAddress = (unCompressedPubKey) => {

    let address = ethUtil.bufferToHex(ethUtil.pubToAddress(unCompressedPubKey));
    console.log(address);
    return address;
}


// module.exports.wGetKey = (keyName, keyVersion, tags, secretName) => {
//     this.getPairKey(mnemonic.value, path);
//     if (tags == secretName) {
//         this.wGetAddress(Buffer.concat([pairKey.pubX, pairKey.pubY]));
//     } else {
//         this.wImportKey(keyName, privateKey, pairKey.pubX, pairKey.pubY);
//     }
// }

// module.exports.wSetSecret = (secretName, value) => {
//     return client.setSecret(vaultUri, secretName, mnemonic);
// }

// module.exports.wImportKey = (importKeyName, key, tags) => {

//     let importKeyName = this.wGetKey.keyName;
//     let key = {
//         kty: 'EC',
//         keyOps: ['sign', 'verify'],
//         crv: 'SECP256K1',
//         privateKey,
//         pubX,
//         pubY
//     };
//     let tags = {
//         secretName = setSecret.secretName
//     };
// }


module.exports
