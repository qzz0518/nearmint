require('dotenv').config();
const nearAPI = require('near-api-js');
const {connect, KeyPair, keyStores, utils} = nearAPI;
const {parseSeedPhrase} = require("near-seed-phrase");
const {readFileSync} = require("fs");

async function fetchWrapper(url, options) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
}

async function getNEATAmount(accountId) {
    const response = await fetchWrapper("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: `
                query {
                    holderInfos(where: { accountId: "${accountId}" }) {
                        amount
                    }
                }
            `
        }),
    });
    const data = await response.json();
    return data.data && data.data.holderInfos.length > 0 ? data.data.holderInfos[0].amount : "0";
}

async function main() {
    const masterAccountId = process.env.CONTRACT_NAME;

    const wallets = JSON.parse(readFileSync('near_wallets.json', 'utf-8'));

    for (const wallet of wallets) {
        const config = {
            networkId: process.env.NETWORK_ID || "mainnet",
            keyStore: new keyStores.InMemoryKeyStore(),
            nodeUrl: process.env.NODE_URL,
        };

        const keyPair = KeyPair.fromString(wallet.privateKey);
        await config.keyStore.setKey(config.networkId, wallet.implicitAccountId, keyPair);
        const near = await connect(config);
        const amount = await getNEATAmount(wallet.implicitAccountId);
        const contractArgs = {
            p: "nrc-20",
            op: "transfer",
            tick: "neat",
            to: masterAccountId,
            amt: amount,
        };
        if (parseInt(amount) > 0) {
            try {
                const account = await near.account(wallet.implicitAccountId);
                await account.functionCall({
                    contractId: "inscription.near", // NEAT 代币合约地址
                    methodName: "inscribe",
                    args: contractArgs,
                    gas: "30000000000000",
                    attachedDeposit: "0", // 根据需要调整
                }).then(result => {
                    let hash = result.transaction.hash;
                    console.log(`${wallet.implicitAccountId}, 操作成功: ${'https://getblock.io/explorers/near/transactions/' + hash}`);
                }).catch(error => {
                    console.error(error);
                });
                console.log(`成功从 ${wallet.implicitAccountId} 向 ${masterAccountId} 转账 ${amount} NEAT`);
            } catch (error) {
                console.error(`从 ${wallet.implicitAccountId} 转账失败: `, error);
            }
        } else {
            console.log(`地址 ${wallet.implicitAccountId} 没有足够的 NEAT`);
        }
    }
}

main().catch(err => console.error(err));
