import { 
    formatPrice,
    getBlockTimestamp,
    getWethPriceAndLiquidity,
    poolInstance,
    getDeeperPriceAndLiquidity,
    tokenInstance,
    formatAmount,
    choosePrice,
    formatFee,
 } from './'

import { WETH_ADDRESS } from '../constants/index'
import { inserSwap } from './CRUD'
import { ethers } from 'ethers'

export const eventHandler = async (
    blockNumber: number, 
    poolAddress: string, 
    eventName: string | any, 
    hash: string,
    _amount0: number,
    _amount1: number,
    sqrtPriceX96: any | any,
    account: string | any
    ) => {
    try {
        const pool = poolInstance(poolAddress)
        const token0Address = await pool.token0()
        const token1Address = await pool.token1()
        const fee = await pool.fee()

        const token0 = tokenInstance(token0Address)
        const token1 = tokenInstance(token1Address)


        const symbol0 = await token0.symbol()
        const symbol1 = await token1.symbol()
        const decimals0 = await token0.decimals()
        const decimals1 = await token1.decimals()
        const string0 = ethers.BigNumber.from(_amount0).toString()
        const string1 = ethers.BigNumber.from(_amount1).toString()
        const amount0 = parseInt(string0)
        const amount1 = parseInt(string1)
        const time = await getBlockTimestamp(blockNumber)
        let price = 0
        let value = 0
        let feePaid = 0
        const formatedAmount0 = formatAmount(amount0, decimals0)
        const formatedAmount1 = formatAmount(amount1, decimals1)

        //SOLD TOKEN1
        if(amount1 > amount0 ){
            if(token0 === WETH_ADDRESS){
                price = formatPrice(token0Address, token1Address, decimals0, decimals1, sqrtPriceX96)
                value = formatAmount(amount1, decimals1) * price
                feePaid = formatFee(fee, value)
            }

            if(token1 === WETH_ADDRESS){
                value = formatAmount(amount1, decimals1)
                feePaid = formatFee(fee, value)
            }

            if(![token0Address, token1Address].includes(WETH_ADDRESS)){
                const wethPrice = await getWethPriceAndLiquidity(token1Address, blockNumber)
                const deeperPrice = await getDeeperPriceAndLiquidity(token1Address, blockNumber)
                price = choosePrice(wethPrice[0]?.price ?? 0, deeperPrice[0]?.price ?? 0)
                value = formatAmount(amount1, decimals1) * price
                feePaid = formatFee(fee, value)
            }            
        }

        //SOLD TOKEN0
        if(amount0 > amount1){
            if(token0 === WETH_ADDRESS){
                value = (amount0 / (10 ** decimals1))
                feePaid = formatFee(fee, value)
            }

            if(token1 === WETH_ADDRESS){
                price = formatPrice(token0Address, token1Address, decimals0, decimals1, sqrtPriceX96)
                value = formatAmount(amount0, decimals0) * price
                feePaid = formatFee(fee, value)
            }

            if(![token0Address, token1Address].includes(WETH_ADDRESS)){
                const wethPrice = await getWethPriceAndLiquidity(token0Address, blockNumber)
                const deeperPrice = await getDeeperPriceAndLiquidity(token0Address, blockNumber)
                price = choosePrice(wethPrice[0]?.price ?? 0, deeperPrice[0]?.price ?? 0)
                value = formatAmount(amount0, decimals0) * price
                feePaid = formatFee(fee, value)
            }  
        }

        console.log(value, 'value outside')

        await inserSwap(
            blockNumber,
            eventName,
            value,
            token0Address,
            token1Address,
            symbol0,
            symbol1,
            formatedAmount0,
            formatedAmount1,
            account,
            time,
            hash,
            feePaid,
            poolAddress
            )
    } catch (error: any) {
        console.log(error.message, 'insertSwap')
    }
}