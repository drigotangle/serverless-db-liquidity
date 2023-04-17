import { ethers } from 'ethers'
import moment from 'moment'

import { provider, ZERO_ADDRESS, WETH_ADDRESS, NFT_MANAGER_ADDRESS, FACTORY_ADDRESS, PINNED_PAIRS, FEE_ARR } from '../constants/index'
import { IPoolData, IPoolsArr } from '../interfaces'
import { ERC20, Nonfungiblepositionmanager, V3Factory } from '../types/ethers-contracts'
import { insertPrice, insertError, insertLiquidity, queryPools } from './CRUD'

const FACTORY_ARTIFACT = require('../ABI/V3Factory.json')
const POOL_ARTIFACT = require('../ABI/V3Pool.json')
const ERC20_ABI = require('../ABI/ERC20.json')
const NftManager = require('../ABI/Nonfungiblepositionmanager.json')



export const tokenInstance = (address: string): any => {
    const token = new ethers.Contract(address, ERC20_ABI, provider)
    return token
}

export const nftManagerInstance = (): any => {
    const nftManager = new ethers.Contract(NFT_MANAGER_ADDRESS, NftManager.abi, provider)
    return nftManager
}

export const factoryInstance = (): any => {
    const token = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ARTIFACT.abi, provider)
    return token
}

export const poolInstance = (address: string) => {
    const pool = new ethers.Contract(address, POOL_ARTIFACT, provider)
    return pool
}

export const getPoolAddress = async (token0: string, token1: string, fee: string): Promise<string | any> => {
    try {
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ARTIFACT.abi, provider)
        const poolAddress = await factory.getPool(token0, token1, fee)
        return poolAddress
    } catch (error: any) {
        console.log(error.message, 'for getPoolAddress')
    }
}

export const getBlockTimestamp = async (blockNumber: number): Promise<string | any> => {
    try {
        const block = await provider.getBlock(blockNumber)
        const timestamp = block?.timestamp
        const formattedDate = moment.unix(timestamp ?? 0).format('YYYY-MM-DD HH:mm:ss')
        return formattedDate
    } catch (error) {
        console.log(error, 'for getting block timestamp')
    }
  }

export const sqrtPriceToPrice = (sqrtPriceX96: any, token0Decimals: any, token1Decimals: any): number => {
  
    let mathPrice = Number(sqrtPriceX96) ** 2 / 2 ** 192;
  
    const decimalAdjustment = 10 ** (token0Decimals - token1Decimals);
    const price = mathPrice * decimalAdjustment;
  
    return price;
  };

export const formatPrice = (token0Address: string, token1Address: string, decimals0: number, decimals1: number, sqrtPriceX96: any): number => {
    if(token0Address > token1Address){
        [ decimals0, decimals1 ] = [ decimals1, decimals0]
    }
    let formatedPrice = sqrtPriceToPrice(sqrtPriceX96, decimals0, decimals1)
    if(token0Address > token1Address){
        formatedPrice = 1 / formatedPrice 
    }
    return formatedPrice
}

export const formatAmount = (amount: number, decimals: number): number => {
    const formatedAmount = amount / (10 ** decimals)
    return formatedAmount
}

export const choosePrice = 
    (
    wethPrice: number | undefined = undefined, 
    deeperPrice: number | undefined = undefined
    ): number | any => {
    if(![wethPrice, deeperPrice].includes(undefined)){
        //@ts-ignore
        return wethPrice > deeperPrice ? wethPrice : deeperPrice
    }
    
    if(wethPrice === undefined && deeperPrice !== undefined){
        return deeperPrice
    }

    if(wethPrice !== undefined && deeperPrice === undefined){
        return wethPrice
    }

    if(wethPrice === undefined && deeperPrice === undefined){
        return 0
    }
}

export const getPoolData = async (poolAddress: string, blockNumber: number): Promise<IPoolData | any> => {
    try {
        const pool = new ethers.Contract(poolAddress, POOL_ARTIFACT, provider)
        const token0Address = await pool.token0()
        const token1Address = await pool.token1()
        const token0 = new ethers.Contract(token0Address, ERC20_ABI, provider)
        const token1 = new ethers.Contract(token1Address, ERC20_ABI, provider)
        const decimals0 = await token0.decimals()
        const decimals1 = await token1.decimals()
        const slot0 = await pool.slot0({blockTag: blockNumber})
        const price = formatPrice(token0Address, token1Address, decimals0, decimals1, slot0.sqrtPriceX96._hex)
        const result = { price, token0Address, token1Address, decimals0, decimals1, token1, token0 }
        return result
    } catch (error: any) {
        console.log(error.message, error.line, 'from getPoolData')
    }
}

export const getWethPriceAndLiquidity = async (address: string, blockNumber: any): Promise<IPoolsArr[] | any> => {
    const feesArr = [500, 3000, 10000]
    let poolsArr: IPoolsArr[] = []
    try {
            const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ARTIFACT.abi, provider)
            for(let i = 0; i < feesArr.length; i++){
                const fee = feesArr[i]
                const poolAddress = await factory.getPool(address, WETH_ADDRESS, fee)
                if(poolAddress !== ZERO_ADDRESS){
                    const poolContract: IPoolData = await getPoolData(poolAddress, blockNumber)
                    let price = poolContract?.price
                    const wethContract = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, provider)
                    const wethBalance = await wethContract.balanceOf(poolAddress, {blockTag: blockNumber})
                    poolsArr.push({
                        poolAddress: poolAddress,
                        price: price,
                        wethBalance: Number(wethBalance._hex) / (10 ** 18)
                    })
                }
            }
            poolsArr.sort((a, b) => {
                return b.wethBalance - a.wethBalance
            })
            return poolsArr
        } catch (error: any) {
            console.log(error.message, 'getWethPriceAndLiquidity')
        }
}

export const getDeeperPriceAndLiquidity = async (address: string, blockNumber: number):  Promise<IPoolsArr[] | any> => {
    let poolsArr: IPoolsArr[] = []
    try {
        const factory = factoryInstance()
        for(const fee of FEE_ARR){
            for(const pinnedAddress of PINNED_PAIRS){
                const pinnedPoolAddress = await factory.getPool(address, pinnedAddress, fee)
                if(pinnedPoolAddress !== ZERO_ADDRESS){
                    const pinnedPool: IPoolData = await getPoolData(pinnedPoolAddress, blockNumber)
                    const wethPool: IPoolsArr[] = await getWethPriceAndLiquidity(pinnedAddress, blockNumber)
                    const wethContract = tokenInstance(WETH_ADDRESS)
                    const wethBalance = await wethContract.balanceOf(wethPool[0].poolAddress, {blockTag: blockNumber})
                    const price = pinnedPool.price * wethPool[0].price
                    poolsArr.push({
                        poolAddress: pinnedPoolAddress,
                        price: price,
                        wethBalance: Number(wethBalance._hex) / (10 ** 18)
                    })
                }
            }
        }
        poolsArr.sort((a, b) => {
            return b.wethBalance - a.wethBalance
        })
        return poolsArr
    } catch (error: any) {
        console.log(error.message, 'getDeeperPriceAndLiquidity')
    }
}

export const pushPrice = async (blockNumber: number) => {
    try {
        const documents: any = await queryPools()
            for(const data of documents){
                const postId = data._id
                if(data.block < blockNumber){
                        if([!data.token0, data.token1].includes(WETH_ADDRESS)){
                            const wethPrice = await getWethPriceAndLiquidity(data.token1, blockNumber)
                            const deeperPrice = await getDeeperPriceAndLiquidity(data.token1, blockNumber)
                            const price = choosePrice(wethPrice[0]?.price, deeperPrice[0]?.price)
                            insertPrice(postId, blockNumber, price)
                        } else {
                            const poolData = await getPoolData(data.pool, blockNumber)
                            insertPrice(postId, blockNumber, poolData?.price)
                        }
                }
            }
    } catch (error) {
        await insertError(error, 'PUSH_PRICE')
    }
}

export const pushLiquidity = async (blockNumber: number) => {
    try {
    const documents: any = await queryPools()
        for(const data of documents){
            const postId = data._id
            if(data.block < blockNumber){
                    if([!data.token0, data.token1].includes(WETH_ADDRESS)){
                        const wethPrice = await getWethPriceAndLiquidity(data.token1, blockNumber)
                        const deeperPrice = await getDeeperPriceAndLiquidity(data.token1, blockNumber)
                        const liquidity = choosePrice(wethPrice[0]?.liquidity, deeperPrice[0]?.liquidity)
                        insertLiquidity(postId, blockNumber, liquidity)
                    }

                    if(data.token0 === WETH_ADDRESS){
                        const token = await tokenInstance(data.token0)
                        const liquidity = await token.balanceOf(data.pool)
                        const formatedLiquidity = formatAmount(Number(liquidity._hex), data.decimals0)
                        insertLiquidity(postId, blockNumber, formatedLiquidity)
                    }

                    if(data.token1 === WETH_ADDRESS){
                        const token = await tokenInstance(data.token1)
                        const liquidity = await token.balanceOf(data.pool)
                        const formatedLiquidity = formatAmount(Number(liquidity._hex), data.decimals1)
                        insertLiquidity(postId, blockNumber, formatedLiquidity)
                    }
            }
        }
    } catch (error) {
        await insertError(error, 'PUSH_LIQUIDITY')
    }
}