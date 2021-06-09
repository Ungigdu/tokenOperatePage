import {
  aswp_abi
} from "./abi.js";

//example await mint("0xcd0E2d0d4F6AC79cB66a97505DBca96B1FAc21ca", "1000000000000000000", [],[],[],[],[],[],[],aswp, me)
export const mint = async (to, eth, erc20_addresses, erc20_amounts, erc721_addresses, erc721_ids, erc1155_addresses, erc1155_ids, erc1155_amounts, aswp, signer) => {
  if(erc20_addresses.length != erc20_amounts.length) throw "erc20 length mismatch";
  if(erc721_addresses.length != erc721_ids.length) throw "erc721 length mismatch";
  if(erc1155_addresses.length != erc1155_ids || erc1155_addresses.length != erc1155_amounts.length ) throw "erc1155 length mismatch";
  let adds = []
  adds = adds.concat(erc20_addresses).concat(erc721_addresses).concat(erc1155_addresses);
  let numbers = [eth]
  numbers = numbers.concat([erc20_addresses.length, erc721_addresses.length, erc1155_addresses.length])
          .concat(erc20_amounts).concat(erc721_ids).concat(erc1155_ids).concat(erc1155_amounts)
    console.log(adds, numbers)
  return await aswp.connect(signer).mint(to, adds, numbers, {value:eth})
}


export const safeMint = async (to, eth, erc20_addresses, erc20_amounts, erc721_addresses, erc721_ids, erc1155_addresses, erc1155_ids, erc1155_amounts, aswp, signer) => {
  if(erc20_addresses.length != erc20_amounts.length) throw "erc20 length mismatch";
  if(erc721_addresses.length != erc721_ids.length) throw "erc721 length mismatch";
  if(erc1155_addresses.length != erc1155_ids || erc1155_addresses.length != erc1155_amounts.length ) throw "erc1155 length mismatch";
  let adds = []
  adds = adds.concat(erc20_addresses).concat(erc721_addresses).concat(erc1155_addresses);
  let numbers = [eth]
  numbers = numbers.concat([erc20_addresses.length, erc721_addresses.length, erc1155_addresses.length])
          .concat(erc20_amounts).concat(erc721_ids).concat(erc1155_ids).concat(erc1155_amounts)
  return await aswp.connect(signer).safeMint(to, adds, numbers, {value:eth})
}


//example await burn("0xcd0E2d0d4F6AC79cB66a97505DBca96B1FAc21ca", 0,"92063250739912222829681859400879777781478015025502172386685207871039626997248","1000000000000000000", [],[],[],[],[],[],[],aswp, me)
export const burn = async (to, salt,tokenId,eth, erc20_addresses, erc20_amounts, erc721_addresses, erc721_ids, erc1155_addresses, erc1155_ids, erc1155_amounts, aswp, signer) => {
  if(erc20_addresses.length != erc20_amounts.length) throw "erc20 length mismatch";
  if(erc721_addresses.length != erc721_ids.length) throw "erc721 length mismatch";
  if(erc1155_addresses.length != erc1155_ids || erc1155_addresses.length != erc1155_amounts.length ) throw "erc1155 length mismatch";
  let adds = []
  adds = adds.concat(erc20_addresses).concat(erc721_addresses).concat(erc1155_addresses);
  let numbers = [eth]
  numbers = numbers.concat([erc20_addresses.length, erc721_addresses.length, erc1155_addresses.length])
          .concat(erc20_amounts).concat(erc721_ids).concat(erc1155_ids).concat(erc1155_amounts)
  return await aswp.connect(signer).burn(to, tokenId, salt, adds, numbers)
}

export const createPair = async (tokenA, tokenB, waitMinutes, aswp, signer) => {
  let ownerB = await aswp.ownerOf(tokenB)
  return await aswp.connect(signer).createPairAsA(ownerB, tokenA, tokenB, waitMinutes)
}

export const checkPair = async (addressA, addressB, aswp) => {
  let pair = await aswp.getPair(addressA, addressB)
  return {
    tokenA: pair[0].toString(),
    tokenB: pair[1].toString(),
    deadline: pair[2].toString()
  }
}

export const confirmSwap = async (addressA, aswp, signer) => {
  await aswp.connect(signer).confirmSwapAsB(addressA)
}

export const listTokenInfo = async(aswp, tokenId) => {
  let log_machine_create = await (async () => {
    let filter = aswp.filters.AssemblyAsset(null, ethers.BigNumber.from(tokenId))
    let abi = ["event AssemblyAsset(address indexed firstHolder,uint256 indexed tokenId,uint256 salt,address[] addresses,uint256[] numbers)"]
    let iface = new ethers.utils.Interface(abi);
    let logs = await aswp.queryFilter(filter)
    let decodedEvents = logs.map(log => iface.parseLog(log));
    return decodedEvents
  })()


  return log_machine_create.map(x=>{
    let args = x.args
    let adds = args.addresses
    let numbers = args.numbers
    let len20 = parseInt(numbers[1].toString())
    let len721 = parseInt(numbers[2].toString())
    let len1155 = parseInt(numbers[3].toString())
    let erc20Address = adds.slice(0,len20)
    let erc721Address = adds.slice(len20, len20+len721)
    let erc1155Address = adds.slice(len20+len721)
    let amount20 = numbers.slice(4, 4+len20)
    let id721 = numbers.slice(4+len20, 4+len20+len721)
    let id1155 = numbers.slice(4+len20+len721, 4+len20+len721+len1155)
    let amount1155 = numbers.slice(4+len20+len721+len1155)

    return {tokenId: args.tokenId.toString(),
            salt: args.salt.toString(),
            addresses: args.addresses,
            numbers: args.numbers.map(x=>x.toString()),
            erc20Address : erc20Address,
            erc721Address: erc721Address,
            erc1155Address: erc1155Address,
            amount20: amount20,
            id721: id721,
            id1155: id1155,
            amount1155: amount1155
          }
  })

}


 //---------------bind--------------------------------

 const aswp_address = "0x7f5463Dfb5F54696b3c1222a5de641b9C567aDc3"

$("#swap_address").html(aswp_address)

 window.mint = mint
 window.safeMint = safeMint
 window.burn = burn
 window.listTokenInfo = listTokenInfo
 window.createPair = createPair
 window.checkPair = checkPair


 window.assets = {
   eth:0,
   erc20Address:[],
   erc20Amount: [],
   erc721Address:[],
   erc721Id:[],
   erc1155Address:[],
   erc1155Id:[],
   erc1155Amount:[]
 }

 $("#clear").click( () =>{
   $("#assets").val("")
   window.assets = {
    eth:0,
    erc20Address:[],
    erc20Amount: [],
    erc721Address:[],
    erc721Id:[],
    erc1155Address:[],
    erc1155Id:[],
    erc1155Amount:[]
  }
 })

 $("#add_eth").click( ()=>{
   window.assets.eth = $("#eth_amount").val()
   showAsset()
 })

 $("#add_erc20").click( ()=>{
   window.assets.erc20Address.push($("#erc20_address").val())
   window.assets.erc20Amount.push($("#erc20_amount").val())
   showAsset()
  })

 $("#add_erc721").click( ()=>{
   window.assets.erc721Address.push($("#erc721_address").val())
   window.assets.erc721Id.push($("#erc721_id").val())
   showAsset()
  })

 $("#add_erc155").click( ()=>{
   window.assets.erc1155Address.push($("#erc1155_address").val())
   window.assets.erc1155Id.push($("#erc1155_id").val())
   window.assets.erc1155Amount.push($("#erc1155_amount").val())
   showAsset()
  })

 function showAsset(){
  $("#assets").val(assetFormat(window.assets))
 }

 function assetFormat(assets){
  let text = ""
  text += "eth:" + assets.eth + "\n"
  for(let i in assets.erc20Address){
    text += "erc20 " + assets.erc20Address[i] + " : "+ assets.erc20Amount[i] + "\n"
  }
  for(let i in assets.erc721Address){
    text += "erc721 " + assets.erc721Address[i] + " : "+ assets.erc721Id[i] + "\n"
  }
  for(let i in assets.erc1155Address){
    text += "erc1155 " + assets.erc1155Address[i] + " : "+ assets.erc1155Id[i] + " amount " + assets.erc1155Amount[i] +"\n"
  }
  return text
 }

  $("#assemble").click( async ()=>{
    let aswp = new ethers.Contract(aswp_address, aswp_abi, window.provider)
    let a = window.assets
    await mint(window.myAddress, a.eth, a.erc20Address, a.erc20Amount,
       a.erc721Address, a.erc721Id, a.erc1155Address, a.erc1155Id, a.erc1155Amount, aswp, window.me)
  })

  $("#query").click( async ()=>{
    let aswp = new ethers.Contract(aswp_address, aswp_abi, window.provider)
    let token_id = $("#token_id").val()
    let r = (await listTokenInfo(aswp, token_id))[0]

    let assets = {
      eth: r.numbers[0],
      erc20Address:r.erc20Address,
      erc20Amount: r.amount20.map(x=>x.toString()),
      erc721Address: r.erc721Address,
      erc721Id: r.id721.map(x=>x.toString()),
      erc1155Address: r.erc1155Address,
      erc1155Id:r.id1155.map(x=>x.toString()),
      erc1155Amount:r.amount1155.map(x=>x.toString())
    }

    $("#token_info").val(assetFormat(assets))

  })

  // export const burn = async (to, salt,tokenId,eth, erc20_addresses, erc20_amounts, erc721_addresses, erc721_ids, erc1155_addresses, erc1155_ids, erc1155_amounts, aswp, signer) => {
  $("#burn").click( async ()=>{
    let token_id = $("#burn_id").val()
    let aswp = new ethers.Contract(aswp_address, aswp_abi, window.provider)
    let r = (await listTokenInfo(aswp, token_id))[0]
    await burn(window.myAddress, r.salt, ethers.BigNumber.from(token_id), r.numbers[0],
    r.erc20Address, r.amount20.map(x=>x.toString()), r.erc721Address, r.id721.map(x=>x.toString()),
    r.erc1155Address, r.id1155.map(x=>x.toString()), r.amount1155.map(x=>x.toString()), aswp, window.me)
  })

  $("#create_pair").click( async ()=>{
    let tokenA = $("#create_pair_tokenA").val()
    let tokenB = $("#create_pair_tokenB").val()
    let waitMinutes = $("#wait_minutes").val()
    let aswp = new ethers.Contract(aswp_address, aswp_abi, window.provider)
    await createPair(tokenA, tokenB, waitMinutes, aswp, window.me)
  })

  $("#check_pair").click( async ()=>{
    let addressA = $("#show_pair_address_A").val()
    let addressB = $("#show_pair_address_B").val()
    let aswp = new ethers.Contract(aswp_address, aswp_abi, window.provider)
    let pair = await checkPair(addressA, addressB, aswp)
    let pair_text = "token_A:" + pair.tokenA + "\n" +
                    "token_B:" + pair.tokenB + "\n" +
                    "deadline:" + pair.deadline
    $("#pair_info").val(pair_text)
  })

  $("#confirm_swap").click( async ()=>{
    let addressA = $("#confirm_swap_tokenA").val()
    let aswp = new ethers.Contract(aswp_address, aswp_abi, window.provider)
    await confirmSwap(addressA, aswp, window.me)
  })
