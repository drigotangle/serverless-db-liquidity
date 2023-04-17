import { MongoClient, ServerApiVersion  } from 'mongodb'
import { getBlockTimestamp } from '.';

const uri = 'mongodb+srv://burgossrodrigo:BeREmhPli0p3qFTq@tangle.hkje2xt.mongodb.net/?retryWrites=true&w=majority'

//@ts-ignore
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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
        await insertError(error, 'insertPool')
    }
}

export const insertPrice = async (postId: any, blockNumber: number, price: number) => {
    try {
        const collection = await mongoClient.db("tangle-db-shimmer").collection("pools")
        const documents = await collection.find({}).toArray()
        const time = await getBlockTimestamp(blockNumber)
        await collection.updateOne(
            {_id: postId},
            {$push: {price: {time: time, price: price, blockNumber: blockNumber}}}
        )
    } catch (error) {
        await insertError(error, 'insertPrice')
    }
}

export const insertLiquidity = async (postId: any, blockNumber: number, liquidity: number) => {
    try {
        const collection = await mongoClient.db("tangle-db-shimmer").collection("pools")
        const time = await getBlockTimestamp(blockNumber)
        await collection.updateOne(
            {_id: postId},
            {$push: {liquidity: {time: time, liquidity: liquidity, blockNumber: blockNumber}}}
        )
    } catch (error) {
        await insertError(error, 'insertLiquidity')
    }
}

export const insertError = async (error: any, event: string) => {
    try {
        const poolsCollection = await mongoClient.
        db("tangle-db-shimmer").
        collection("errors")
        await poolsCollection.insertOne({
            error: error.message,
            event: event
        })
    } catch (error: any) {
        console.log(error.message)
    }
}

export const queryPools = async () => {
    try {
        const collection = await mongoClient.db("tangle-db-shimmer").collection("pools")
        const documents = await collection.find({}).toArray()
        return documents
    } catch (error) {
        await insertError(error, 'QueryPool')
    }
}