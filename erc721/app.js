import {
  erc721_abi, erc721batch_abi} from "./abi.js";
import {mergeLog} from "../js/utils.js";

export const tokenInfo = async (token_address, tokenId, provider) => {
  let token = new ethers.Contract(token_address, erc721_abi, provider)
  return [await token.ownerOf(tokenId), await token.tokenURI(tokenId)]
}
window.tokenInfo = tokenInfo

export const setApproveAll = async (token_address, target_address, okOrNot, provider, signer) => {
  let token = new ethers.Contract(token_address, erc721_abi, provider)
  await token.connect(signer).setApprovalForAll(target_address, okOrNot)
}
window.setApproveAll = setApproveAll

export const batchMint = async (token_address, to, amount, provider, signer) => {
  let token = new ethers.Contract(token_address, erc721batch_abi, provider)
  await token.connect(signer).batchMint(to, amount)
}
window.batchMint = batchMint

export const getLogFromTo = async(token_address, user_address, provider) => {
  let result = await Promise.all([
    getLogTransferFilterFrom(token_address, user_address, provider),
    getLogTransferFilterTo(token_address, user_address, provider)
  ])
  return mergeLog(result[0],result[1])
}

window.getLogFromTo = getLogFromTo

export const getLogTransferFilterFrom = async(token_address, user_address, provider) => {
  return getLogTransfer(token_address, user_address, 0, provider)
}
window.getLogTransferFilterFrom = getLogTransferFilterFrom

export const getLogTransferFilterTo = async(token_address, user_address, provider) => {
  return getLogTransfer(token_address, user_address, 1, provider)
}
window.getLogTransferFilterTo = getLogTransferFilterTo

export const getAllTokensOf = async(token_address, user_address, provider) => {
  let logs = await getLogFromTo(token_address, user_address, provider)
  let tokens = new Set()
  for(let log of logs){
    if(log.args.to == user_address){
      tokens.add(log.args.tokenId.toString())
    }
    if(log.args.from == user_address){
      tokens.delete(log.args.tokenId.toString())
    }
  }
  return Array.from(tokens)
}
window.getAllTokensOf = getAllTokensOf

//type 0 from, 1 to
const getLogTransfer = async(token_address, user_address, type, provider) => {
  let token = new ethers.Contract(token_address, erc721_abi, provider)
  let log_transfer = await (async () => {
    let filter
    if (type == 0) {
      filter = token.filters.Transfer(user_address)
    }else{
      filter = token.filters.Transfer(null, user_address)
    }
    let abi = ["event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"]
    let iface = new ethers.utils.Interface(abi);
    let logs = await token.queryFilter(filter)
    let decodedEvents = logs.map(log => {
      let info = iface.parseLog(log)
      info["blockNumber"] = log.blockNumber
      info["transactionIndex"] = log.transactionIndex
      return info
    });
    return decodedEvents
  })()
  return log_transfer
}

//bind----------------------------------------------
$("#query_owner").click(async () =>{
  let token_address = $("#check_owner_token").val();
  let token_id = $("#check_owner_id").val();
  let [owner, uri] = await tokenInfo(token_address, token_id, window.provider)
  $("#owner").html(owner)
  $("#token_uri").html(uri).attr("href", uri)
})

$("#approve").click(async ()=>{
  let token_address = $("#approve_token").val()
  let account = $("#approve_account").val()
  await setApproveAll(token_address, account, true, window.provider, window.me)
})


$("#batch_mint").click(async ()=>{
  let batch_address = $("#batch_address").val()
  let to = $("#target_address").val()
  let amount = $("#amount").val()
  await batchMint(batch_address, to, amount, window.provider, window.me)
})

$("#query_tokens").click(async ()=>{
  let contract_address = $("#query_address").val()
  let owner_address = $("#owner_address").val()
  let tokens = await getAllTokensOf(contract_address, owner_address, window.provider)
  $("#batch_log").val(tokens)
})
