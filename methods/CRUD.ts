import { MongoClient, ServerApiVersion  } from 'mongodb'
import { eventNames } from 'process';

//@ts-ignore
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

export const getLastTVL = async () => {
    try {
        const collection = await mongoClient.db("tangle-db-shimmer").collection("tvl")
        const documents = await collection.find({}).toArray()
        if(documents.length > 0 && documents !== undefined){
            const tvl = documents[documents.length - 1].tvl
            if(!isNaN(tvl))
            return tvl
        }
        return 0
    } catch (error) {
        console.log(error, 'for getLastTVL')
    }
}

    // token0: events.args.token0,
    // token1: events.args.token1,
    // symbol0: symbol0,
    // symbol1: symbol1,
    // name0: name0,
    // name1: name1,
    // decimals0: decimals0,
    // decimals1: decimals1,
    // fee: events.args.fee,
    // tickSpacing: events.args.tickSpacing,
    // pool: events.args.pool,
    // price: [{time: time, price: 0}],
    // liquidity: [{time: time, liquidity: Number(liquidity._hex / (10 ** 18))}],
    // block: blockNumber,
    // hash: events.transactionHash   

export const insertPool = async (
    token0Address: string,
    token1Address: string,
    symbol0: string,
    symbol1: string,
    name0: string,
    name1: string,
    decimals0: number,
    decimals1: number,
    liquidity: number,
    price: number,
    fee: number,
    tickSpacing: number,
    poolAddress: string,
    time: string,
    blockNumber: number,
    hash: string
) => {
    try {

        /**
         * @tangular here goes the mongo logic
         */

        await mongoClient.connect()
        const poolsCollection = await mongoClient.db("tangle-db-shimmer").
        collection("pools")
        await poolsCollection.insertOne({
            token0: token0Address,
            token1: token1Address,
            symbol0: symbol0,
            symbol1: symbol1,
            name0: name0,
            name1: name1,
            decimals0: decimals0,
            decimals1: decimals1,
            fee: fee,
            tickSpacing: tickSpacing,
            pool: poolAddress,
            price: [{time: time, price: price}],
            liquidity: [{time: time, liquidity: liquidity}],
            block: blockNumber,
            hash: hash          
        })
    } catch (error) {
        
    }
}

export const updateTVL = async (
    eventName: string,
    blockNumber: number,
    time: string,
    hash: string,
    sumValue: number,
    poolAddress: string
) => {
    try {
        const currentlyTVL = await getLastTVL()
        const tvlCollection = await mongoClient.db("tangle-db-shimmer").collection("tvl")

        if(eventName === 'IncreaseLiquidity'){
        await tvlCollection.insertOne({ time: time, tvl: currentlyTVL + sumValue, wethToken1: true, blockNumber: blockNumber, hash: hash, poolAddress: poolAddress })
        }

        if(eventName === 'DecreaseLiquidity'){
            await tvlCollection.insertOne({ time: time, tvl: currentlyTVL - sumValue, wethToken1: true, blockNumber: blockNumber, hash: hash, poolAddress: poolAddress })
        }

    } catch (error) {
        
    }
}