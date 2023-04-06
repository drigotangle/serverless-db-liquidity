export interface IBlock {
    number: number
    timestamp: number
}

export interface IPoolData {
    price: number
    token0Address: string
    token1Address: string
    decimals0: number
    decimals1: number
    token0: any
    token1: any
}

export interface IPoolsArr {
    poolAddress: string
    price: number
    wethBalance: number
}