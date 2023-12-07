# Near 铭文脚本

## 安装

```
yarn install
```
修改 .env.example 为 .env

## 配置环境变量
在项目根目录中创建 .env 文件，并填写以下信息：
```
NETWORK_ID=mainnet
#NODE节点在https://docs.near.org/api/rpc/providers找
NODE_URL=
#你的地址 可以是 .near 或者 纯地址
CONTRACT_NAME=
#你的助记词
MNEMONIC=''
```

## 运行
```
node index.js
```

## 钱包批量生成
```
node wallet_gen.js
```

代码里面可以调整生成的个数，implicitAccountId 才是你的地址

## 批量转账

```
node transfer.js
```
请先执行批量生成，然后再执行批量转账
默认给生成的 near_wallets.json 里面所有的地址转1个near


## MINT 数量查询
```
node query.js
```

## 归集 neat 到主账号
请在归集前 使用query 查询小号的余额，然后确认小号有足够的gas
然后再确认.env的CONTRACT_NAME是你的主账号地址，然后再执行归集
```
node collect.js
```