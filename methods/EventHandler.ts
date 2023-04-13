import { 
    choosePrice,
    formatAmount,
    formatPrice,
    getBlockTimestamp,
    getDeeperPriceAndLiquidity,
    getWethPriceAndLiquidity,
    poolInstance,
    tokenInstance,
 } from './'

import { WETH_ADDRESS } from '../constants/index'
import { insertPool } from './CRUD'

export const eventHandler = async (
    blockNumber: number, 
    poolAddress: string, 
    token0Address: string, 
    token1Address: string, 
    fee: number, 
    tickSpacing: number, 
    hash: string
    ) => {
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
        const balance0 = await token0.balanceOf(poolAddress)
        let price = 0
        let liquidity = 0

        if(token1Address === WETH_ADDRESS){
            const pool = poolInstance(poolAddress)
            const { sqrtPriceX96 } = await pool.slot0({blockTag: blockNumber})
            const sqrtPrice = sqrtPriceX96._hex
            price = formatPrice(token0Address, token1Address, decimals0, decimals1, sqrtPrice)
            liquidity = formatAmount(Number(balance1._hex), decimals1)
        }

        if(token0Address === WETH_ADDRESS){
            const pool = poolInstance(poolAddress)
            const { sqrtPriceX96 } = await pool.slot0({blockTag: blockNumber})
            const sqrtPrice = sqrtPriceX96._hex
            const formatedPrice = formatPrice(token0Address, token1Address, decimals0, decimals1, sqrtPrice)
            price = formatedPrice
            liquidity = formatAmount(Number(balance0._hex), decimals0)
        }

        if(![token0Address, token1Address].includes(WETH_ADDRESS)){
            const wethPrice = await getWethPriceAndLiquidity(token1Address, blockNumber)
            const deeperPrice = await getDeeperPriceAndLiquidity(token1Address, blockNumber)
            price = choosePrice(wethPrice[0].price, deeperPrice[0].price)
            liquidity = (Number(balance1._hex), decimals1) * price
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
    } catch (error: any) {
        console.log(error.message)
    }
}