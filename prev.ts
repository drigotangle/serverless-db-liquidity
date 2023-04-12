import { eventHandler } from './methods/EventHandler'
import { NFT_MANAGER_ADDRESS, provider } from './constants/index'
import { ethers } from 'ethers'

const Nonfungiblepositionmanager = require('./ABI/Nonfungiblepositionmanager.json')

const NFPM = new ethers.Contract(NFT_MANAGER_ADDRESS, Nonfungiblepositionmanager.abi, provider)


const decreaseLiquidityListener = async (blockNumber) => {
    try {
            const decreaseLiquidityEvent: any = await NFPM.queryFilter(
                'DecreaseLiquidity',
                blockNumber - 1,
                blockNumber                
            )
            if(decreaseLiquidityEvent.length > 0){
                            //CALL LAMBDA
            await eventHandler(
                decreaseLiquidityEvent.eventName,
                decreaseLiquidityEvent.args.tokenId._hex,
                blockNumber,
                decreaseLiquidityEvent.args.amount0._hex,
                decreaseLiquidityEvent.args.amount1._hex,
                decreaseLiquidityEvent.transactionHash,
                )
            }
    } catch (error) {
        console.log(error)
    }
}

/**
 * 
 * @param {*} blockNumber 
 */

const increaseLiquidityListener = async (blockNumber) => {
    try {
            const increaseLiquidityEvent: any = await NFPM.queryFilter(
                'IncreaseLiquidity',
                blockNumber - 1,
                blockNumber                
            )
            //CALL LAMBDA
            await eventHandler(
                increaseLiquidityEvent.eventName,
                increaseLiquidityEvent.args.tokenId._hex,
                blockNumber,
                increaseLiquidityEvent.args.amount0._hex,
                increaseLiquidityEvent.args.amount1._hex,
                increaseLiquidityEvent.transactionHash,
                )
    } catch (error) {
        console.log(error)
    } 
}


const forLoop = async () => {
    const block = await provider.getBlockNumber()
    for(let i = 89532; i < 89865; i++){
        console.log(i)
        await decreaseLiquidityListener(i)
        await increaseLiquidityListener(i)
        if(i === block){
            console.log('acabou')
            break
        }
    }
}

forLoop()