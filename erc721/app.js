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
  let logFrom = await getLogTransferFilterFrom(token_address, user_address, provider)
  let logTo = await getLogTransferFilterTo(token_address, user_address, provider)
  return mergeLog(logFrom,logTo)
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
  let [owner, id] = await tokenInfo(token_address, token_id, window.provider)
  $("#owner").html(owner)
  $("#token_uri").html(id)
})

$("#approve").click(async ()=>{
  let token_address = $("#approve_token").val()
  let account = $("#approve_account").val()
  await setApproveAll(token_address, account, true, window.provider, window.me)
})

const batch_nft = "0x17f7EeeE3761CCCF9948C117F52d202aE9E0b5D7"

$("#batch_mint").click(async ()=>{
  let to = $("#target_address").val()
  let amount = $("#amount").val()
  await batchMint(batch_nft, to, amount, window.provider, window.me)
})

$("#query_tokens").click(async ()=>{
  let contract_address = $("#query_address").val()
  let owner_address = $("#owner_address").val()
  let tokens = await getAllTokensOf(contract_address, owner_address, window.provider)
  $("#batch_log").val(tokens)
})
