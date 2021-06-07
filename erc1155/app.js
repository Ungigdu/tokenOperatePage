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

export const createNFT = async (token, tokenId, to, amount,signer) => {
  await token.connect(signer).create(to, tokenId, amount, "", []);
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
  await createNFT(token, tokenId, create_to, amount, window.me)
})
