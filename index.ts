import { eventHandler } from './methods/EventHandler'

module.exports.handler = async (event) => {
  
  const blockNumber = event.pathParameters.blockNumber;
  const poolAddress = event.pathParameters.pool;
	const eventName = event.pathParameters.eventName;
	const hash = event.pathParameters.hash;
  const amount0 = event.pathParameters.amount0
  const amount1 = event.pathParameters.amount1
  const sqrtPriceX96 = event.pathParameters.sqrtPriceX96
  const account = event.pathParameters.account



  await eventHandler(
    blockNumber,
    poolAddress,
    eventName,
    hash,
    amount0,
    amount1,
    sqrtPriceX96,
    account
  ).then(() => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Go Serverless v3.0! Your function executed successfully!',
          input: event,
        },
        null,
        2
      ),
    };
  })
};