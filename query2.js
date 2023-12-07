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

async function processAccountsFromFile(fileName) {
    try {
        const fileContent = readFileSync(fileName, 'utf8');
        const accounts = fileContent.split('\n');
        let totalAmount = 0;

        for (const accountId of accounts) {
            if (accountId.trim().length > 0) {
                const amount = await getNEATAmount(accountId.trim());
                totalAmount += amount/100000000;
                console.log(`账号: ${accountId}, NEAT 余额: ${amount}`);
            }
        }

        console.log(`所有账户的 NEAT 余额总和: ${totalAmount}`);
    } catch (err) {
        console.error(`读取文件时出错: ${err}`);
    }
}

// 从 1.txt 读取地址并获取 NEAT 数量
processAccountsFromFile('address.txt');