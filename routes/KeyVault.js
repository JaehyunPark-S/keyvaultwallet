const msRestAzure = require('ms-rest-azure');
const KeyVaultManagementClient = require('azure-arm-keyvault');

const subscriptionId = 'bb57642d-03b8-44f1-999d-497eef5faf47';
const resourceGroup = 'aztestvault1';
const vaultName = 'aztestvault12';
const tenantGUID = '5687646b-6d96-41a3-a987-01c60ef92c0';

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
        const paramethers = {
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