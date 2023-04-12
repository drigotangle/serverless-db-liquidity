import { 
    getPoolAddress,
    getBlockTimestamp,
    getWethPriceAndLiquidity,
    tokenInstance,
    nftManagerInstance,
    getDeeperPriceAndLiquidity,
    choosePrice,
    formatAmount
 } from './'

import { WETH_ADDRESS } from '../constants/index'
import { insertLiquidity, updateTVL } from './CRUD'


export const eventHandler = async (eventName: string, tokenId: any, blockNumber: number, amount0: any, amount1: any, hash: string) => {

    const NFPM = nftManagerInstance()

    try {
        const position = await NFPM.positions(BigInt(tokenId))
        const fee = position.fee

        const token0Address = position.token0
        const token1Address = position.token1

        const token0 = tokenInstance(token0Address)
        const token1 = tokenInstance(token1Address)

        const symbol0 = await token0.symbol()
        const symbol1 = await token1.symbol()
        const decimals0 = await token0.decimals()
        const decimals1 = await token1.decimals()
        const poolAddress = await getPoolAddress(position.token0, position.token1, fee)
        const account = await NFPM.ownerOf(Number(tokenId))
        const time = await getBlockTimestamp(blockNumber)
        let price0
        let price1
        let value: any

        console.log(
            blockNumber,
            eventName,
            token0Address,
            token1Address,
            value,
            symbol0,
            symbol1,
            amount0,
            amount1,
            account,
            time,
            hash,
            poolAddress
        )
        
        amount0 = amount0 / (10 ** decimals0)
        amount1 = amount1 / (10 ** decimals1)
    

            if(position.token0 === WETH_ADDRESS){
                value = amount0 * 2
            }

            if(position.token1 === WETH_ADDRESS){
                value = amount1 * 2
            }

            if(![position.token1, position.token2].includes(WETH_ADDRESS)){
                Promise.all([
                    getWethPriceAndLiquidity(token0Address, blockNumber),
                    getDeeperPriceAndLiquidity(token0Address, blockNumber),
                    getWethPriceAndLiquidity(token1Address, blockNumber),
                    getDeeperPriceAndLiquidity(token1Address, blockNumber)
                ]).then(([
                    wethPrice0,
                    deeperPrice0,
                    wethPrice1,
                    deeperPrice1
                ]) => {
                    price0 = choosePrice(wethPrice0[0]?.price, deeperPrice0[0]?.price)
                    price1 = choosePrice(wethPrice1[0]?.price, deeperPrice1[0]?.price)
                    
                    //@ts-ignore
                    const value0 = price0 * formatAmount(amount0, decimals0)
                    //@ts-ignore
                    const value1 = price1 * formatAmount(amount1, decimals1)
                    value = value0 + value1
                })
                //@ts-ignore
                await updateTVL(eventName, blockNumber, time, hash, value, poolAddress)
                await insertLiquidity(
                    blockNumber,
                    eventName,
                    token0Address,
                    token1Address,
                    value,
                    symbol0,
                    symbol1,
                    amount0,
                    amount1,
                    account,
                    time,
                    hash,
                    poolAddress
                )
            }
    } catch (error: any) {
        console.log(error.message, 'for handle event') 
    }
}