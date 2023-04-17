import { ethers } from 'ethers'

export const wssProvider = new ethers.providers.WebSocketProvider("wss://ws.json-rpc.evm.testnet.shimmer.network/")
export const provider = new ethers.providers.JsonRpcProvider("https://json-rpc.evm.testnet.shimmer.network")
export const NFT_MANAGER_ADDRESS = '0x5461C7e4a81435019dB84F88a4761aF257B8240D'
export const WETH_ADDRESS = '0x549197e1F8a978e37C9DfA17bf96e69BC49E05aF'
export const FACTORY_ADDRESS = '0x8eB105CFc7ec7ebF126586689683a9104E6ec91b'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const FEE_ARR = [500, 3000, 10000]
export const PINNED_PAIRS = [
    '0x23574310616A5d42E2c06364960d4AA1D3CA9DDB', //USDT
    '0x9484ec867B3D530042731E7D0966A71D8cb4D6EE', //USDC
    '0x87ba1c836adb867efad3f31aaed8c9e6f73c2510', //WBTC
    '0xe4d65FBFEDADEB8C46ca78330344A47e0899EC46' //TUSDT
]
export const uri = 'mongodb+srv://burgossrodrigo:BeREmhPli0p3qFTq@tangle.hkje2xt.mongodb.net/?retryWrites=true&w=majority'
