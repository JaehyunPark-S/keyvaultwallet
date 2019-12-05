const msRestAzure = require('ms-rest-azure');
const KeyVaultManagementClient = require('azure-arm-keyvault');
const {subscriptionId, resourceGroup , vaultName, tenantGUID} = require('../config/config').keyVaultConfig;



// Interaction Login
let client;
msRestAzure
    .interactiveLogin()
    .then(credentials => {
        client = new KeyVaultManagementClient(credentials, subscriptionId);
        return client.vaults.list();
    })
    .then(vaults => {
        console.dir(vaults, {depth: null, colors: true});
        const parameters = {
            location: 'East US',
            properties: {
                sku: {family: 'A', name: 'standard'},
                accessPolicies: [],
                enabledForDeployment: false,
                tenantId: tenantGUID
            }
        };
        console.info('Creating vault ${{vaultName} ...');
        return client.vaults.createOrUpdate(resourceGroup, vaultName, parameters);
    })
    .then(vault => console.dir(vault, {depth: null, colors: true}))
    .catch(err => {
        console.log('An error occured');
        console.dir(err, {depth: null, colors: true});
    });