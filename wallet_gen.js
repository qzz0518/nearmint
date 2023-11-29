const bip39 = require('bip39');
const nearAPI = require('near-api-js');
const base58 = require('bs58');
const fs = require('fs');
const { KeyPairEd25519 } = nearAPI.utils.key_pair;

async function generateNearCredentials(numberOfWallets) {
    let walletData = [];

    for (let i = 0; i < numberOfWallets; i++) {
        const keyPair = KeyPairEd25519.fromRandom();

        // 记录钱包信息
        const wallet = {
            privateKey: keyPair.secretKey,
            publicKey: keyPair.publicKey.toString(),
            implicitAccountId: convertPublicKeyToImplicitAccountId(keyPair.publicKey)
        };
        walletData.push(wallet);
    }
    fs.writeFileSync('near_wallets.json', JSON.stringify(walletData, null, 4));
}

function convertPublicKeyToImplicitAccountId(publicKey) {
    const keyWithoutPrefix = publicKey.toString().replace('ed25519:', '');

    const keyBytes = base58.decode(keyWithoutPrefix);

    return Buffer.from(keyBytes).toString('hex');
}

// 示例：生成 10 个 NEAR 钱包
generateNearCredentials(10).then(() => {
    console.log("Wallets generated and saved to near_wallets.json");
});
