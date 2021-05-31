await window.ethereum.enable()
window.provider = new ethers.providers.Web3Provider(window.ethereum);
window.me = window.provider.getSigner()
window.myAddress = await window.me.getAddress()

$("#my_address").html(window.myAddress)
