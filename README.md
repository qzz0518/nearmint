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