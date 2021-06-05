import {
  erc20_abi
} from "./abi.js";

export const balanceOf = async (token_address, user_address, provider) => {
  let token = new ethers.Contract(token_address, erc20_abi, provider)
  return (await token.balanceOf(user_address)).toString()
}

window.balanceOf = balanceOf

export const tokenInfo = async (token_address, provider) => {
  let token = new ethers.Contract(token_address, erc20_abi, provider)
  let result = await Promise.all([
    token.symbol(),
    token.decimals()
  ])
  return [
    result[0],
    result[1].toString()
  ]
}

window.tokenInfo = tokenInfo

const max =  "115792089237316195423570985008687907853269984665640564039457584007913129639935"

export const approve = async (token_address, target_address, provider, signer) => {
  let token = new ethers.Contract(token_address, erc20_abi, provider)
  await token.connect(signer).approve(target_address, max)
}

window.approve = approve

//bind----------------------------------------------
$("#query_balance").click(async ()=>{
  let token_address = $("#check_balance_token").val()
  let account = $("#check_balance_account").val()
  let balance = await balanceOf(token_address, account, window.provider)
  let info = await tokenInfo(token_address, window.provider)
  $("#amount").html(balance / 10**info[1])
  $("#decimal").html(info[1])
  $("#symbol").html(info[0])
})

$("#approve").click(async ()=>{
  let token_address = $("#approve_token").val()
  let target_address = $("#approve_account").val()
  await approve(token_address, target_address, window.provider, window.me)
})
