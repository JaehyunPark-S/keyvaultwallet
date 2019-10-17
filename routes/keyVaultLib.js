var KeyVault = require('azure-keyvault');
var AuthenticationContext = require('adal-node').AuthenticationContext;
const {clientId, clientSecret , vaultUri} = require('../config/config').keyVaultLibConfig;


// Authenticator - retrieves the access token
var authenticator = function (challenge, callback) {

    // Create a new authentication context.
    var context = new AuthenticationContext(challenge.authorization);

    // Use the context to acquire an authentication token.
    return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function (err, tokenResponse) {
        if (err) throw err;
        // Calculate the value to be set in the request's Authorization header and resume the call.
        var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;

        return callback(null, authorizationValue);
    });

};

var credentials = new KeyVault.KeyVaultCredentials(authenticator);
var client = new KeyVault.KeyVaultClient(credentials);

module.exports.setSecret = (secretName, value) => {
    return client.setSecret(vaultUri, secretName, value);
}

module.exports.getSecretVersion = (secretName, maxResults) => {
    return client.getSecretVersions(vaultUri, secretName, maxResults);
}

module.exports.getSecret = (secretName, secretVersion) => {
    return client.getSecret(vaultUri, secretName, secretVersion);
}
/*let secretName = 'secrettest',
    value = 'myValue',
    optionsopt = {
        // contentType: 'sometype',
        // tags: 'sometag',
        // secretAttributes: 'someAttributes',
        // contentType: 'sometype',
        // customHeaders: 'customHeaders'
    };
client.setSecret(vaultUri, secretName, value, optionsopt).then((results) => {
    console.log(results);
})

let secretName1 = 'mysecret'
secretVersion = '' //leave this blank to get the latest version;
client.getSecret(vaultUri, secretName1, secretVersion).then((result) => {
    console.log(result);
}) */

module.exports.deleteSecret = (secretName) => {
    return client.deleteSecret(vaultUri, secretName);
}




module.exports.getKey = (keyName, keyVersion) => {
    // client.getKey(vaultUri, 'testkey', '59166984efe84208b923918876125ab7').then((result) => {
    //     console.log(result);
    // })

    // let result = await client.getKey(vaultUri, 'testkey', '59166984efe84208b923918876125ab7');
    // console.log(result);

    return client.getKey(vaultUri, keyName, keyVersion);
}

module.exports.getKeyVersions = (keyName, max) => {
    return client.getKeyVersions(vaultUri, keyName, {'maxresults' : max});
}

module.exports.createKey = (keyName, keyType) => {
    optionsopt = {
        keyOps: ['sign', 'verify'],
        curve: 'SECP256K1'
        // keysize: '2048',
        // attribute: {},
        // tags: 'sometag'
    };
    return client.createKey(vaultUri, keyName, keyType, optionsopt);
}
/*optionsopt = {
    keyOps: ['sign', 'verify'],

    curve: 'SECP256K1'
    // keysize: '2048',
    // attribute: {},
    // tags: 'sometag'
};
client.createKey(vaultUri, 'testcr', 'EC', optionsopt).then((results) => {
    console.log(results);
})*/


module.exports.importKey = (keyName, d, x, y, tags) => {
    let key = {
        kty: 'EC',
        keyOps: ['sign', 'verify'],
        crv: 'SECP256K1',
        d,
        x,
        y
    },
        options = {
            tags
        };


    return client.importKey(vaultUri, keyName, key, options);
}
/*let key = {
    kty: 'EC',
    keyOps: ['sign', 'verify'],
    crv: 'SECP256K1',
    d:Buffer.from('Vgyk4k6SQnGJ2rMtR19XTBYBik3pfF9+aJXAfjk7hoY=', 'Base64'),
    x:Buffer.from('zXcMOqKdEB6a/AR7ZjI6j15vsQXB46XV4nVye4Zh4PY=', 'Base64'),
    y:Buffer.from('c6UhjMtcT0zt2HIxpBgHj/Ns4JJ/TNkgXJAuypdZrdI=', 'Base64')
},
options = {};


client.importKey(vaultUri, 'testimport', key, options).then((results) => {
    console.log(results);
}) */



module.exports.deleteKey = (keyName) => {
    return client.deleteKey(vaultUri, keyName);
}
/*client.deleteKey(vaultUri, 'testcr').then((results) => {
    console.log(results);
}) */


module.exports.sign = (keyName, keyVersion, algorithm, value) => {

    let valueBuf = Buffer.from(value, 'Base64');
    return client.sign(vaultUri, keyName, keyVersion, algorithm, valueBuf);
}
/*let value = Buffer.from("Vgyk4k6SQnGJ2rMtR19XTBYBik3pfF9+aJXAfjk7hoY=", 'Base64');
client.sign(vaultUri, 'testkey', '59166984efe84208b923918876125ab7', 'ECDSA256', value).then((results) => {
    console.log(results.result.toString('hex'));
}) */


module.exports.verify = (keyName, keyVersion, algorithm, digest, signature) => {

    let digestBuf = Buffer.from(digest, 'Base64'),
        signatureBuf = Buffer.from(signature, 'hex');

    return client.verify(vaultUri, keyName, keyVersion, algorithm, digestBuf, signatureBuf);
}
/*let digest = Buffer.from("Vgyk4k6SQnGJ2rMtR19XTBYBik3pfF9+aJXAfjk7hoY=", 'Base64'),
    signature = Buffer.from("06ae8b1f6cd66e976ad8d3b344db794e6f11ef86c4cf1de6299a280cb5e95f93518045b8ecf28df6cb090c31cf3cd5da89ca71fcc142078b38ce4b93d1b7d0b6", "hex");


client.verify(vaultUri, 'testkey', '59166984efe84208b923918876125ab7', 'ECDSA256', digest, signature).then((results) => {
    console.log(results);
})*/  //signature 값이 이상함.



module.exports.backupKey = (keyName) => {
    return client.backupKey(vaultUri, keyName);
}
/*client.backupKey(vaultUri, 'ImportSoftKeyTest').then((results) => {
    console.log(results.value.toString('hex'));
})*/


module.exports.restoreKey = function (keyBundle) {
    let keyBundleBuf = Buffer.from(keyBundle, 'hex');
    return client.restoreKey(vaultUri, keyBundleBuf);
}
/*let keyBundle = Buffer.from("", 'hex');
client.restoreKey(vaultUri, keyBundle).then((results) => {
    console.log(results);
}) */

