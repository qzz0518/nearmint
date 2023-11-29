require('dotenv').config();
const nearAPI = require('near-api-js');
const {connect, KeyPair, keyStores} = nearAPI;
const {parseSeedPhrase} = require("near-seed-phrase");

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
    const {secretKey} = parseSeedPhrase(mnemonic);
    const keyPair = KeyPair.fromString(secretKey);
    await config.keyStore.setKey(config.networkId, config.contractName, keyPair);
    const account = await near.account(config.contractName);
    // 打印余额
    console.log("账户余额：", (await account.getAccountBalance()).available);
    // 定义合约调用参数
    const contractArgs = {
        p: "nrc-20",
        op: "mint",
        tick: "neat",
        amt: "100000000"
    };

    const numberOfTimes = 100;

    for (let i = 0; i < numberOfTimes; i++) {
        try {
            const result = await account.functionCall({
                contractId: "inscription.near",
                methodName: "inscribe",
                args: contractArgs,
                gas: "30000000000000",
                attachedDeposit: "0",
            });
            let hash = result.transaction.hash
            console.log(`第 ${i + 1} 次合约调用结果：`, 'https://nearblocks.io/zh-cn/txns/' + hash);
        } catch (error) {
            console.error(`第 ${i + 1} 次合约调用出错：`, error);
        }
    }
}

main();
