// 通过 Google Sheets 查询 Token 余额信息，支持主网及其他链的 ERC20 和 ERC721 （NFT）
// 调用方式：getTokenBalance(walletAddress, contractAddress, network)
// Author: @gm365 (https://twitter.com/gm365) & ChatGPT
// 使用指南：https://twitter.com/gm365/status/1626146212868149248

// ❗️ 请修改此处的RPC为私有RPC，如 Infura 或 Alchemy，否则很容易超时报错
// 定义 RPC_MAP 变量
const RPC_MAP = {
  "mainnet": "https://rpc.ankr.com/eth",
  "op": "https://optimism-mainnet.public.blastapi.io",
  "arb": "https://rpc.ankr.com/arbitrum",
  "polygon": "https://polygon-bor.publicnode.com",
  "bsc": "https://bscrpc.com"
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
