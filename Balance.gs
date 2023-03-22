// 通过 Google Sheets 查询 Token 余额信息，支持主网及其他链的 ERC20 和 ERC721 （NFT）
// 调用方式：getTokenBalance(walletAddress, contractAddress, network)
// 2023.02.21 新增功能：查询 zkSync 1.0 余额及 tx 数量
// 使用指南：https://twitter.com/gm365/status/1626146212868149248
// Github 源码：https://github.com/gm365/BalanceChecker
// Author: @gm365 (https://twitter.com/gm365) & ChatGPT

// ❗️ 请修改此处的RPC为私有RPC，如 Infura 或 Alchemy，否则很容易超时报错
// 定义 RPC_MAP 变量
const RPC_MAP = {
  "mainnet": "https://rpc.ankr.com/eth",
  "op": "https://optimism-mainnet.public.blastapi.io",
  "arb": "https://rpc.ankr.com/arbitrum",
  "polygon": "https://polygon-bor.publicnode.com",
  "bsc": "https://bscrpc.com",
  "goerli": "https://rpc.ankr.com/eth_goerli"
};

// 查询 ETH 等原生资产余额
function getEthBalance(walletAddress, network) {
  let rpcLink = RPC_MAP[network];
  if (!rpcLink) {
    return "Error: Invalid Network Name";
  }
  const data = "0x" + "balanceOf" + "000000000000000000000000" + walletAddress.slice(2);
  const response = UrlFetchApp.fetch(rpcLink, {
    method: "post",
    payload: JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_getBalance",
      "params": [walletAddress, "latest"],
      "id": 1
    }),
    contentType: "application/json",
    muteHttpExceptions: true
  });
  let result = JSON.parse(response.getContentText());
  let balance = result.result;
  return parseInt(balance, 16) / 10 ** 18;
}


// 获取 Token 精度信息，如果是NFT，默认返回1
function getTokenDecimal(contractAddress, network) {
  let rpcLink = RPC_MAP[network];
  if (!rpcLink) {
    return "Error: Invalid Network Name";
  }
  const data = '0x313ce567';
  var response = UrlFetchApp.fetch(rpcLink, {
    method: "post",
    payload: JSON.stringify({
      "jsonrpc":"2.0",
      "method":"eth_call",
      "params":[{
        "to": contractAddress,
        "data": data
      }, "latest"],
      "id":1
    }),
    contentType: "application/json",
    muteHttpExceptions: true
  });
  
  // var decimal = parseInt(response.getContentText(), 16);
  let result = JSON.parse(response.getContentText()).result;
  let decimal = parseInt(result, 16);
  if (isNaN(decimal)) {
    return 0;
  }
  return decimal;
}

// 获取 Token 余额，ERC20 或者 ERC721
function getTokenBalance(walletAddress, contractAddress, network) {
  let rpcLink = RPC_MAP[network];
  if (!rpcLink) {
    return "Error: Invalid Network Name";
  }
  // 查询原生资产余额，ETH，BNB，MATIC等
  if (["eth", "bnb", "matic"].includes(contractAddress.toLowerCase())) {
    return getEthBalance(walletAddress, network);
  }

  const data = "0x70a08231" + "000000000000000000000000" + walletAddress.slice(2);
  const response = UrlFetchApp.fetch(rpcLink, {
    method: "post",
    payload: JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_call",
      "params": [{
        "to": contractAddress,
        "data": data
      }, "latest"],
      "id": 1
    }),
    contentType: "application/json",
    muteHttpExceptions: true
  });
  let result = JSON.parse(response.getContentText());
  let balance = result.result;
  let decimal = getTokenDecimal(contractAddress, network);
  return parseInt(balance, 16) / 10 ** decimal;
}

// 获取地址在不同链的tx数量
function getTxCount(address,network) {
  
  // 根据 network 获取 RPC
  let rpcLink = RPC_MAP[network];
  if (!rpcLink) {
    return "Error: Invalid Network Name";
  }

  // 查询地址的交易数量
  const transactionRequest = {
    jsonrpc: "2.0",
    method: "eth_getTransactionCount",
    params: [address, "latest"],
    id: 1
  };
  const transactionResponse = UrlFetchApp.fetch(rpcLink, {
    method: "POST",
    payload: JSON.stringify(transactionRequest),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const transactionCountHex = JSON.parse(transactionResponse.getContentText()).result;

  // 将十六进制转换为十进制
  const transactionCount = parseInt(transactionCountHex, 16);

  // 返回交易数量
  return transactionCount;
}


// 💡 查询 zkSync 1.0 主网余额
// 🔧 调用方式 =getZKSyncBalance(B2, "ETH")
// 支持币种: ETH, USDC, USDT, WBTC, DAI, ZZ 等
function getZKSyncBalance(address, token) {
  if (['USDC', 'USDT'].includes(token.toUpperCase())) {
    decimal = 6;
  } 
  else {
    decimal = 18;
  }

  var apiUrl = 'https://api.zksync.io/api/v0.2/accounts/' + address;
  try {
    var result = JSON.parse(UrlFetchApp.fetch(apiUrl));
    var balance = result.result.committed.balances[token.toUpperCase()];
    return balance ? balance / Math.pow(10, decimal) : 0;
  } catch (e) {
    console.log('余额获取失败', e);
    return 0;
  }
}

// 获取 zkSync 1.0 tx 数量
function getZkSyncTxCount(address) {
  const api_url = "https://api.zksync.io/api/v0.2/accounts/" + address;
  try {
    const result = JSON.parse(UrlFetchApp.fetch(api_url));
    const nonce = result["result"]["committed"]["nonce"];
    return nonce;
  } catch (e) {
    Logger.log(`Nonce 获取失败, ${e}`);
    return 0;
  }
}

// 需要配置 etherscan apikey
const apiKey = 'XXXXX'
function getEvmLastTime(address,network) {
  // 根据 network 获取 RPC
  let rpcLink = RPC_MAP[network];
  if (!rpcLink) {
    return "Error: Invalid Network Name";
  }
  const transactionRequest = {
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    "params": [],
    id: 1
  };
  const transactionResponse = UrlFetchApp.fetch(rpcLink, {
    method: "POST",
    payload: JSON.stringify(transactionRequest),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const result = JSON.parse(transactionResponse.getContentText()).result;
  const lastBlcokNum = parseInt(result, 16);

  //https://docs.etherscan.io/api-endpoints/accounts#get-a-list-of-normal-transactions-by-address  
  const url =`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=${lastBlcokNum}&page=1&offset=10&sort=desc&apikey=${apiKey}`
  const response = JSON.parse(UrlFetchApp.fetch(url).getContentText()).result;
  if(response.length===0){return ''}
  const history = response.filter((item)=>item.from.toLowerCase()===address.toLowerCase()).shift()
  const timeStamp =  parseInt(history.timeStamp)
  return formatTime(timeStamp*1000);
}
function formatTime (timeStamp) {
  const date = new Date(timeStamp)
  const yy = date.getFullYear().toString().slice(2)
  const MM = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  return `${yy}-${MM}-${dd} ${hh}:${mm}`
}
