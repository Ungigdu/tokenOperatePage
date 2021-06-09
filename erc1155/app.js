import {
  erc1155_owner_create_abi
} from "./abi.js";

export const queryMetadata = async (token) => {
  let result = await Promise.all([
    token.name(),
    token.symbol()
  ])
  return result
}

export const createNFT = async (token, tokenId, to, amount, uri,signer) => {
  await token.connect(signer).create(to, tokenId, amount, uri, []);
}

export const showBalanceAndInfo = async (token, tokenId, address) => {
  let result = await Promise.all([
    token.uri(tokenId),
    token.balanceOf(address, tokenId)
  ])
  return result
}

//bind----------------------------------------------
$("#query_metadata").click(async ()=>{
  let token_address = $("#show_metadata_contract").val()
  let token = new ethers.Contract(token_address, erc1155_owner_create_abi, window.provider)
  let result = await queryMetadata(token)
  $("#token_name").html(result[0])
  $("#token_symbol").html(result[1])
})

$("#create_NFT").click(async ()=>{
  let token_address = $("#create_nft_contract").val()
  let token = new ethers.Contract(token_address, erc1155_owner_create_abi, window.provider)
  let tokenId = $("#create_nft_id").val()
  let create_to = $("#create_to").val()
  let amount = $("#create_amount").val()
  let uri = $("#create_uri").val()
  await createNFT(token, tokenId, create_to, amount, uri, window.me)
})


$("#query_token_info").click(async ()=>{
  let user_address = $("#show_info_address").val()
  let token_address = $("#show_info_contract").val()
  let token_id = $("#show_info_id").val()
  let token = new ethers.Contract(token_address, erc1155_owner_create_abi, window.provider)
  let result = await showBalanceAndInfo(token, token_id, user_address)
  $("#balance").html(result[1].toString())
  $("#uri").html(result[0])
})
