require('dotenv').config();
const {readFileSync} = require("fs");
const nearAPI = require('near-api-js');
const {connect, keyStores,utils} = nearAPI;

async function fetchWrapper(url, options) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
}

async function neatCheck(accountId, near) {
    const response = await fetchWrapper("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
        "headers": {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "content-type": "application/json",
            "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
        },
        "referrer": "https://near.social/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify({
            "query": `
        query {
          holderInfos(
            where: {
              accountId: "${accountId}"
              ticker: "neat"
            }
          ) {
            accountId
            amount
          }
        }
      `
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    })
    const data = await response.json();
    if (data.data && data.data.holderInfos.length > 0) {
        const info = data.data.holderInfos[0];
        const account = await near.account(info.accountId);
        const balance = await account.getAccountBalance();
        const balanceFormat = utils.format.formatNearAmount(balance.available.toString(),6);
        console.log(`地址: ${info.accountId} NEAR 余额: ${balanceFormat}, MINT数量: ${info.amount}`);
    } else {
        console.log(`未找到 ${accountId} 的 NEAT 信息`);
    }

}

const wallets = JSON.parse(readFileSync('near_wallets.json', 'utf-8'));
const recipients = wallets.map(wallet => wallet.implicitAccountId);
async function main() {
    const config = {
        networkId: process.env.NETWORK_ID || "mainnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: process.env.NODE_URL,
    };

    const near = await connect(config);
    for (const recipient of recipients) {
        await neatCheck(recipient, near);
    }
}

main().catch(err => console.error(err));
