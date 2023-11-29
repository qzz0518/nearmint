const {readFileSync} = require("fs");

async function fetchWrapper(url, options) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
}
function neatCheck(accountId) {
    return fetchWrapper("https://api.thegraph.com/subgraphs/name/inscriptionnear/neat", {
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
            "query":`
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
    }).then(response => response.json())
        .then(data => {
            const info = data.data.holderInfos[0];
            const formattedAccountId = info.accountId.substring(0, 20);
            console.log(`账户ID: ${formattedAccountId} 数量: ${info.amount}`);
        });
}

const wallets = JSON.parse(readFileSync('near_wallets.json', 'utf-8'));
const recipients = wallets.map(wallet => wallet.implicitAccountId);
async function main() {
    for (const recipient of recipients) {
        await neatCheck(recipient);
    }
}

main().catch(err => console.error(err));
