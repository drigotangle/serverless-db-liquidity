import { 
    formatPrice,
    getBlockTimestamp,
    getWethPriceAndLiquidity,
    poolInstance,
    sqrtPriceToPrice,
    tokenInstance,
 } from './'

import { WETH_ADDRESS } from '../constants/index'
import { insertPool } from './CRUD'

export const eventHandler = async (blockNumber, poolAddress, token0Address, token1Address, fee, tickSpacing, hash) => {
    try {
        const token0 = tokenInstance(token0Address)
        const token1 = tokenInstance(token1Address)

        const symbol0 = await token0.symbol()
        const symbol1 = await token1.symbol()
        const decimals0 = await token0.decimals()
        const decimals1 = await token1.decimals()
        const name0 = await token0.name()
        const name1 = await token1.name()
        const time = await getBlockTimestamp(blockNumber)
        const balance1 = await token1.balanceOf(poolAddress)
        let price
        let liquidity

        if(token1Address === WETH_ADDRESS){
            const pool = poolInstance(poolAddress)
            const { sqrtPriceX96 } = await pool.slot({blockTag: blockNumber})
            const sqrtPrice = sqrtPriceX96._hex
            price = sqrtPriceToPrice(sqrtPrice, decimals0, decimals1)
        }

        if(token0Address === WETH_ADDRESS){
            const pool = poolInstance(poolAddress)
            const { sqrtPriceX96 } = await pool.slot({blockTag: blockNumber})
            const sqrtPrice = sqrtPriceX96._hex
            const formatedPrice = formatPrice(token0Address, token1Address, decimals0, decimals1, sqrtPrice)
            price = formatedPrice
        }

        if(![token0Address, token1Address].includes(WETH_ADDRESS)){
            const wethPrice = await getWethPriceAndLiquidity(token1Address, blockNumber)
            price = wethPrice[0].price
            liquidity = (Number(balance1._hex) / (10 ** decimals1)) * (wethPrice[0].price ?? 0)
        }

        await insertPool(
            token0Address,
            token1Address,
            symbol0,
            symbol1,
            name0,
            name1,
            decimals0,
            decimals1,
            liquidity,
            price,
            fee,
            tickSpacing,
            poolAddress,
            time,
            blockNumber,
            hash
            )
    } catch (error) {
        
    }
}