import { eventHandler } from './methods/EventHandler'

module.exports.handler = async (event) => {
  
  const eventName = event.pathParameters.eventName;
	const tokenId = event.pathParameters.tokenId;
	const blockNumber = event.pathParameters.blockNumber;
	const amount0 = event.pathParameters.amount0;
	const amount1 = event.pathParameters.amount1;
	const hash = event.pathParameters.hash;

  await eventHandler(
    eventName,
    tokenId,
    blockNumber,
    amount0,
    amount1,
    hash,
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