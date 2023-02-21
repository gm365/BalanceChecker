# BalanceChecker Tool V3.3 版


第三版做了大幅更新，具体内容请查看原始推文： [V3.3 版多钱包余额查询工具说明](https://twitter.com/gm365/status/1626146212868149248)

V3.1版 [表格模板](https://docs.google.com/spreadsheets/d/1fi9nAjEffAmScBMAGegBYChqZ_3xZYGlr8RakAaz51E/edit?usp=sharing)

## 功能

* 💡 多链原生资产（ETH、BNB等）余额查询
* 💡 多链 ERC20 资产余额查询
* 💡 多链 ERC721 资产（NFT）数量查询
* 💡 新增：查询钱包地址在不同链上的 tx 数量
* 💡 新增：查询 zkSync 1.0 余额
* 💡 新增： 查询 zkSync 1.0 tx 数量


## 使用方法

在单元格内输入查询语句

### 查询 Token 余额：

`=getTokenBalance(B2, "ETH", "mainnet")`

`=getTokenBalance(钱包地址，资产合约地址，链的简称)`

### 查询 tx 数量

`=getTxCount(B2, "mainnet")`
`=getTxCount(address,network)`

## 使用建议

* 建议配置私有RPC，否则查询容易报错
* 建议一次性不要查询过多地址（比如几百上千条）
* Google Sheets 对外API访问有每日数量限制
* 暂不支持 ERC1155 类型的 NFT 查询



## V 1.0 版使用 Google Sheets 一键检查多钱包、多链余额


### 链接

* 原始推文 -> [Google Sheets神器](https://twitter.com/gm365/status/1551827163095388161)



* [Sheets表格模版](https://docs.google.com/spreadsheets/d/1Zvgm9ITZvb36pOSD5oaSPeROMS8dGDltjKd-lcZczgc/edit?usp=sharing)
