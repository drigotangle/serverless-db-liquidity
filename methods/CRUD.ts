import { MongoClient, ServerApiVersion  } from 'mongodb'

const uri = 'mongodb+srv://burgossrodrigo:BeREmhPli0p3qFTq@tangle.hkje2xt.mongodb.net/?retryWrites=true&w=majority'

//@ts-ignore
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

export const inserSwap = async (
    blockNumber: number,
    eventName: string,
    value: number,
    token0Address: string,
    token1Address: string,
    symbol0: string,
    symbol1: string,
    amount0: number,
    amount1: number,
    account: string,
    time: string,
    hash: string,
    feePaid: number
) => {
    try {
        const collectionSwaps = await mongoClient.db("tangle-db-shimmer").collection("swap-transactions")
        await collectionSwaps.insertOne({ 
            block: blockNumber,
            eventName: eventName,
            value: value,
            token0Address: token0Address,
            token1Address: token1Address,
            symbol0: symbol0,
            symbol1: symbol1,
            amount0: amount0,
            amount1: amount1,
            account: account,
            time: time,
            hash: hash,
            feePaid: feePaid
         })
    } catch (error) {
        return error
    }
}