require('dotenv').config();
const nearAPI = require('near-api-js');
const {connect, KeyPair, keyStores} = nearAPI;
const {parseSeedPhrase} = require("near-seed-phrase");
const {readFileSync} = require("fs");
const {utils} = require("near-api-js");

async function main() {
    const config = {
        networkId: process.env.NETWORK_ID || "mainnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: process.env.NODE_URL,
    };

    const near = await connect(config);
    let walletData = [];
    const mnemonic = process.env.MNEMONIC;
    const { secretKey } = parseSeedPhrase(mnemonic);
    const keyPair = KeyPair.fromString(secretKey);
    await config.keyStore.setKey(config.networkId, process.env.CONTRACT_NAME, keyPair);
    walletData.push({ privateKey: secretKey, implicitAccountId: process.env.CONTRACT_NAME });
    try {
        walletData = JSON.parse(readFileSync('near_wallets.json', 'utf-8'));
    } catch (e) {
        console.log('未找到 near_wallets.json，使用配置的主钱包');
    }

    const contractArgs = {
        p: "nrc-20",
        op: "mint",
        tick: "neat",
        amt: "100000000"
    };


    async function performInscribe(wallet, contractArgs, numberOfTimes) {
        for (let i = 0; i < numberOfTimes; i++) {
            try {
                const keyPair = KeyPair.fromString(wallet.privateKey);
                await config.keyStore.setKey(config.networkId, wallet.implicitAccountId, keyPair);
                const account = await near.account(wallet.implicitAccountId);
                const balance = await account.getAccountBalance();
                if (utils.format.parseNearAmount(balance.available) > 0) {
                    const result = await account.functionCall({
                        contractId: "inscription.near",
                        methodName: "inscribe",
                        args: contractArgs,
                        gas: "30000000000000",
                        attachedDeposit: "0",
                    });
                    let hash = result.transaction.hash;
                    console.log(`${wallet.implicitAccountId}, 第 ${i + 1} 次操作成功: ${'https://nearblocks.io/zh-cn/txns/' + hash}`);
                } else {
                    console.log(`账户 ${wallet.implicitAccountId} 余额不足`);
                    break; // 如果余额不足，跳出循环
                }
            } catch (error) {
                console.error(`第 ${i + 1} 次操作失败: `, error);
            }
        }
    }
    // 10 次操作 是每个钱包都打10次
    Promise.all(walletData.map(wallet => performInscribe(wallet, contractArgs, 10)))
        .then(() => {
            console.log("所有操作完成");
        })
        .catch(error => {
            console.error("操作中有错误发生: ", error);
        });
}

main();
