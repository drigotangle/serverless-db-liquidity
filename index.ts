import { eventHandler } from './methods/EventHandler'

module.exports.handler = async (event) => {
  
  const blockNumber = event.pathParameters.blockNumber;
  const poolAddress = event.pathParameters.pool;
	const token0Address = event.pathParameters.token0;
	const token1Address = event.pathParameters.token1;
	const fee = event.pathParameters.fee;
	const tickSpacing = event.pathParameters.tickSpacing;
	const hash = event.pathParameters.hash;

  await eventHandler(
    blockNumber,
    poolAddress,
    token0Address,
    token1Address,
    fee,
    tickSpacing,
    hash
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