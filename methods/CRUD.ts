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

export const insertLiquidity = async (
    blockNumber: number,
    eventName: string,
    token0Address: string,
    token1Address: string,
    value: number,
    symbol0: string,
    symbol1: string,
    amount0: number,
    amount1: number,
    account: string,
    time: string,
    hash: string,
    poolAddress: string
) => {
    try {

        /**
         * @tangular here goes the mongo logic
         */

        await mongoClient.connect()
        const liquidityTxCollection = await mongoClient.db("tangle-db-shimmer").collection("liquidity-transactions")
        await liquidityTxCollection.insertOne({ 
            block: blockNumber,
            eventName: eventName,
            token0Address: token0Address,
            token1Address: token1Address,
            value: value,
            symbol0: symbol0,
            symbol1: symbol1,
            amount0: amount0,
            amount1: amount1,
            account: account,
            time: time,
            hash: hash,
            poolAddress: poolAddress
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