import { 
    getPoolAddress,
    getBlockTimestamp,
    getWethPriceAndLiquidity,
    tokenInstance,
    nftManagerInstance
 } from './'

import { NFT_MANAGER_ADDRESS, WETH_ADDRESS, provider } from '../constants/index'
import { insertLiquidity, updateTVL } from './CRUD'

const ERC20 = require('../ABI/ERC20.json')

export const eventHandler = async (eventName, tokenId, blockNumber, amount0, amount1, hash) => {

    const NFPM = nftManagerInstance()

    try {
        const position = await NFPM.positions(BigInt(tokenId))
        const fee = position.fee

        const token0Address = position.token0
        const token1Address = position.token1

        const token0 = tokenInstance(token0Address, ERC20, provider)
        const token1 = tokenInstance(token1Address, ERC20, provider)

        const symbol0 = await token0.symbol()
        const symbol1 = await token1.symbol()
        const decimals0 = await token0.decimals()
        const decimals1 = await token1.decimals()
        const poolAddress = await getPoolAddress(position.token0, position.token1, fee)
        const account = await NFPM.ownerOf(Number(tokenId))
        const time = await getBlockTimestamp(blockNumber)
        
        amount0 = amount0 / (10 ** decimals0)
        amount1 = amount1 / (10 ** decimals1)
    

            if(position.token0 === WETH_ADDRESS){
                const value = amount0 * 2

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

            if(position.token1 === WETH_ADDRESS){
                const value = amount1 * 2

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

            if(![position.token1, position.token2].includes(WETH_ADDRESS)){
                const priceAndLiquidity0 = await getWethPriceAndLiquidity(token0Address, blockNumber)
                const value0 = (priceAndLiquidity0[0]?.price ?? 0) * (amount0) / (10 ** decimals0)
                const priceAndLiquidity1 = await getWethPriceAndLiquidity(token1Address, blockNumber)
                const value1 = (priceAndLiquidity1[0]?.price ?? 0) * (Number(amount0) / (10 ** decimals0))
                const sumValue = value0 + value1

                await updateTVL(eventName, blockNumber, time, hash, sumValue, poolAddress)


                await insertLiquidity(
                    blockNumber,
                    eventName,
                    token0Address,
                    token1Address,
                    sumValue,
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

    } catch (error) {
        
    }
}