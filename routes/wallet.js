var keyVaultLib = require('./keyVaultLib');
var express = require('express');
var router = express.Router();
var WalletLib = require('./WalletLib');

function getVersion(idUrl) {
  var words = idUrl.split('/');

  let version = '';
  if (words.length > 0) {
    version = words[words.length - 1];
  }
  return version;
}

async function setSecret(secretName, mnemonic) {
  let isExsistSecret = await keyVaultLib.getSecretVersion(secretName, 1);
  if (isExsistSecret != 0) {
    return {
      error: {
        code: 9016,
        message: "ERROR : Already secretName was made by somebody"
      }
    };
  }
  if (mnemonic == null) {
    mnemonic = WalletLib.generate();
  }

  let result = await keyVaultLib.setSecret(secretName, mnemonic);
  console.log(result);

  let secretVersion = getVersion(result.id);

  return {
    secretName: secretName,
    secretVersion: secretVersion,
    mnemonic: mnemonic
  };

}
router.post('/generate', async function (req, res, next) {
  let { secretName } = req.body;
  let underbar = "_";
  let isUnderbar = secretName.indexOf(underbar);
  if (isUnderbar != -1) {
    res.json({
      error: {
        code: 9999,
        message: "ERROR : Cannot include underbar"
      }
    });
    return;
  }
  let rtn = await setSecret(secretName);

  res.json(rtn);
});

router.post('/restore', async function (req, res, next) {
  let { secretName, mnemonic } = req.body;
  let isExsistSecret = await keyVaultLib.getSecretVersion(secretName, 1);
  if (isExsistSecret.length > 0) {
    let result = await keyVaultLib.getSecret(secretName, "");
    if (result.value == mnemonic) {
      let secretVersion = getVersion(result.id);
      res.json({
        secretName,
        secretVersion
      })
      return;
    }
  }
  let rtn = await setSecret(secretName, mnemonic);
  delete rtn["mnemonic"];
  res.json(rtn);
});


// router.get('/getSecretVersion', async function (req, res, next){
//   let {secretName, maxResults} = req.body;
//   let result = await keyVaultLib.getSecretVersion(secretName, maxResults);
//   console.log(result);
//   if(result != 0) {
//     console.log("ERROR : already secretName was made by somebody");
//     resulttrue = result;
//   } else {
//     console.log("You can make this secretName")
//   }

//   res.json({
//     resulttrue : resulttrue
//   }); 
// });


router.post('/address', async function (req, res, next) {
  let { secretName, secretVersion, keyName, path } = req.body;
  let isExsistSecret = await keyVaultLib.getSecretVersion(secretName, 1);
  console.log(isExsistSecret);
  let error;
  if (isExsistSecret.length == 0) {
    error = { message: "ERROR : Is not exist secretName" };
  } else {
    let isSecretVersion = getVersion(isExsistSecret[0].id)
    if (isSecretVersion != secretVersion) {
      error = { message: "ERROR : Is not exist secretVersion" };
    }
  }

  if (error) {
    res.status(400).json({
      error: {
        ...error,
        code: "400"
      }
    });
    return;
  }

  let secretResult = await keyVaultLib.getSecret(secretName, secretVersion);
  let mnemonic = secretResult.value
  console.log(mnemonic);
  let keyVersionResult = await keyVaultLib.getKeyVersions(keyName, 1);

  let needImport = keyVersionResult.length == 0;
  let keyVersion = "";
  if (!needImport) {
    keyVersion = getVersion(keyVersionResult[0].kid);
    let isGetKey = await keyVaultLib.getKey(keyName, keyVersion);
    if (isGetKey.tags.secretName != secretName || isGetKey.tags.path != path) {
      needImport = true;
    }
  }

  let pairKey = await WalletLib.getPairKey(mnemonic, path);

  if (needImport) {

    let importKeyResult = await keyVaultLib.importKey(keyName, pairKey.privateKey, pairKey.pubX, pairKey.pubY, { secretName: secretName, path: path });

    keyVersion = getVersion(importKeyResult.key.kid);
  }

  let address = await WalletLib.getAddress(Buffer.concat([pairKey.pubX, pairKey.pubY]));

  console.log(address);

  res.json({
    address,
    keyVersion
  });

});


router.post('/sign', async function (req, res, next) {
  // console.log(req.body)
  // console.log(req.query)
  // console.log(req.param)
  // console.log(req)
  let { keyName, keyVersion, message } = req.body;
  let messageBuf = Buffer.from(message, 'Base64');
  //console.log(messageBuf.toString("hex"));
  // let digestBuf = Buffer.from(digest, 'Base64'),
  //       signatureBuf = Buffer.from(signature, 'hex');
  let signatureResult = await keyVaultLib.sign(keyName, keyVersion, 'ECDSA256', messageBuf);
  console.log(signatureResult);
  let signature = signatureResult.result
  let verifyResult = await keyVaultLib.verify(keyName, keyVersion, 'ECDSA256', messageBuf, signature);
  console.log(verifyResult);

  res.json({
    signature: signature.toString('hex'),
    verify: verifyResult.value,
    keyName
  });
});

module.exports = router;
