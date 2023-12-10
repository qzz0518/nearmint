require('dotenv').config();
const nearAPI = require('near-api-js');
const { connect, KeyPair, keyStores, utils } = nearAPI;
const { parseSeedPhrase } = require("near-seed-phrase");
const {readFileSync} = require("fs");

async function main() {
    const config = {
        networkId: process.env.NETWORK_ID || "mainnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: process.env.NODE_URL,
        contractName: process.env.CONTRACT_NAME,
    };

    // 连接到 NEAR
    const near = await connect(config);
    const mnemonic = process.env.MNEMONIC;
    const { secretKey } = parseSeedPhrase(mnemonic);
    const keyPair = KeyPair.fromString(secretKey);
    await config.keyStore.setKey(config.networkId, config.contractName, keyPair);
    const mainAccount = await near.account(config.contractName);


    const wallets = JSON.parse(readFileSync('near_wallets.json', 'utf-8'));

    for (const wallet of wallets) {
        try {
            const keyPair = KeyPair.fromString(wallet.privateKey);
            await config.keyStore.setKey(config.networkId, wallet.implicitAccountId, keyPair);
            const account = await near.account(wallet.implicitAccountId);

            // 查询小号余额
            const balance = await account.getAccountBalance();
            // 99%的余额转出
            let availableBalance = BigInt(balance.available);
            let transferAmount = availableBalance * 99n / 100n;
            let amountYoctoNEAR = transferAmount.toString();
            console.log(amountYoctoNEAR)
            console.log(`地址: ${wallet.implicitAccountId} NEAR 余额: ${utils.format.formatNearAmount(balance.available.toString(),6)}, 转账金额: ${utils.format.formatNearAmount(amountYoctoNEAR,6)}`);
            if (availableBalance < 20000000000000000000000) {
                console.log(`地址: ${wallet.implicitAccountId} NEAR 余额: ${utils.format.formatNearAmount(balance.available.toString(),6)}, 小于 0.02 NEAR, 不转账`);
                continue;
            }
            const result = await account.sendMoney(
                mainAccount.accountId,
                amountYoctoNEAR
            );
            console.log(`从 ${wallet.implicitAccountId} 转账成功: 交易哈希 ${result.transaction.hash}`);
        } catch (error) {
            console.error(`从 ${wallet.implicitAccountId} 转账失败: `, error);
        }
    }
}

main();
