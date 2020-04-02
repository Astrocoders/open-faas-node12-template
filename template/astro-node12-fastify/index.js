const fastify = require('fastify')
const cors = require('cors')
const helmet = require('helmet')
const handler = require('./function/handler')

const port = process.env.http_port || 3000

const app = fastify({
  logger: process.env.ENABLE_LOGGING === 'true',
})

class FunctionEvent {
  constructor(req) {
    this.body = req.body
    this.headers = req.headers
    this.method = req.req.method
    this.query = req.query
    this.path = req.req.url
  }
}

class FunctionContext {
  constructor() {
    this.statusCode = 200
    this.headerValues = {}
    this.result = null
    this.error = null
  }

  status(value) {
    if (!value) {
      return this.statusCode
    }

    this.statusCode = value
    return this
  }

  headers(value) {
    if (!value) {
      return this.headerValues
    }

    this.headerValues = value
    return this
  }

  succeed(result) {
    this.result = result
    return this
  }

  fail(error) {
    this.error = error
    return this
  }
}

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', optionsSuccessStatus: 200 }))

app.all('/*', async (request, reply) => {
  const fnEvent = new FunctionEvent(request)
  const fnContext = new FunctionContext()

  try {
    const functionResult = await handler(fnEvent, fnContext)

    reply.headers(functionResult.headers()).status(functionResult.status())
    return functionResult.result
  } catch (err) {
    reply.code(500)
    return err.toString ? err.toString() : err
  }
})

app.listen(port, (err, address) => {
  if (err) throw err

  app.log.info(`Server listening on ${address}`)
})
