import ethers from 'ethers'

export const wssProvider = new ethers.WebSocketProvider("wss://ws.json-rpc.evm.testnet.shimmer.network/")
export const provider = new ethers.JsonRpcProvider("https://json-rpc.evm.testnet.shimmer.network")
export const NFT_MANAGER_ADDRESS = '0x5461C7e4a81435019dB84F88a4761aF257B8240D'
export const WETH_ADDRESS = '0x549197e1F8a978e37C9DfA17bf96e69BC49E05aF'
export const FACTORY_ADDRESS = '0x8eB105CFc7ec7ebF126586689683a9104E6ec91b'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
