var keyVaultLib = require('./keyVaultLib');
var express = require('express');
var router = express.Router();
var WalletLib = require('./WalletLib');
/* GET users listing. 
router.get('/', function(req, res, next) {
  res.json({
    name: 'jh',
    age: 24
  });
}); */

/* CREATE users keys. */
router.post('/create', async function (req, res, next) {
  let { keyName, keyType } = req.body;
  let result = await keyVaultLib.createKey(keyName, keyType)
  console.log(result);
  res.json(
    result
  );
});

/* IMPORT users keys */
router.put('/import', async function (req, res, next) {
  let { keyName, d, x, y } = req.body;
  let result = await keyVaultLib.importKey(keyName, Buffer.from(d, 'base64'), Buffer.from(x, 'base64'), Buffer.from(y, 'base64'));
  console.log(result);
  res.json(
    result
  );
});

/* GET users keys. */
router.get('/get', async function (req, res, next) {
  let { keyName, keyVersion } = req.query;
  let result = await keyVaultLib.getKey(keyName, keyVersion)
  console.log(result);
  res.json(
    result
  );
});

/* DELETE users keys. */
router.delete('/delete', async function (req, res, next) {
  let { keyName } = req.body;
  let result = await keyVaultLib.deleteKey(keyName)
  console.log(result);
  res.json(
    result
  );
});

/* DELETESECRET users keys. */
router.delete('/deleteS', async function (req, res, next) {
  let { secretName } = req.body;
  let result = await keyVaultLib.deleteSecret(secretName)
  console.log(result);
  res.json(
    result
  );
});

/* SIGN users keys */
router.post('/sign', async function (req, res, next) {
  let { keyName, keyVersion, algorithm, value } = req.body;
  let result = await keyVaultLib.sign(keyName, keyVersion, algorithm, value)
  console.log(result);
  let jsonObject = {
    signresult: result.result.toString('hex'),
    type: 'sign'
  };
  res.json(jsonObject);
});

/* VERIFY users keys */
router.post('/verify', async function (req, res, next) {
  let { keyName, keyVersion, algorithm, digest, signature } = req.body;
  let result = await keyVaultLib.verify(keyName, keyVersion, algorithm, digest, signature)
  console.log(result);
  res.json({
    result
  });
});

/* BACKUP users keys. */
router.post('/backup', async function (req, res, next) {
  let { keyName } = req.body;
  let result = await keyVaultLib.backupKey(keyName)
  console.log(result);
  res.json({
    value: result.value.toString('hex')
  });
});

/* RESTORE users keys. */
router.post('/restore', async function (req, res, next) {
  let { keyBundle } = req.body;
  let result = await keyVaultLib.restoreKey(keyBundle)
  console.log(result);
  res.json(
    result
  );
});

router.get('/getS', async function (req, res, next) {
  let { secretName, secretVersion } = req.query;
  console.log(secretName);
  let isExsistSecret = await keyVaultLib.getSecretVersion(secretName, 1);
  console.log(isExsistSecret);
  let result = await keyVaultLib.getSecret(secretName, secretVersion)
  console.log(result);
  res.json(
    result
  );
});

module.exports = router;
