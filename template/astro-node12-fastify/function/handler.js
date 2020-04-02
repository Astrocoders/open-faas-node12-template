'use strict'

const sleep = () => new Promise(resolve => setTimeout(resolve, 3000))

module.exports = async (event, context) => {
  const result = {
    status: 'Received input: ' + JSON.stringify(event.body),
  }

  await sleep()

  return context.status(200).succeed(result)
}
