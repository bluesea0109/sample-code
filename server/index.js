/* eslint consistent-return:0 */

const express = require('express')
const cors = require('cors')
const logger = require('./logger')
const argv = require('minimist')(process.argv.slice(2))
const setup = require('./middlewares/frontendMiddleware')
const mongoose = require('mongoose')
const isDev = process.env.NODE_ENV !== 'production'
const ngrok = (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel ? require('ngrok') : false
const path = require('path')
const resolve = require('path').resolve
const app = express()
const bodyParser = require('body-parser')

const mongoUri = isDev ? process.env.MONGODB_LOCAL_URI : process.env.MONGODB_URI

mongoose.connect(mongoUri, {
  useMongoClient: true,
  /* other options */
})

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi)
// In production we need to pass these values in instead of relying on webpack

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/public', express.static(path.join(__dirname, 'public')))

setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
})

// get the intended host and port number, use localhost and port 5000 if not provided
const customHost = argv.host || process.env.HOST
const host = customHost || null // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost'

const port = argv.port || process.env.PORT || 5000

// Start your app.
app.listen(port, host, err => {
  if (err) {
    return logger.error(err.message)
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    ngrok.connect(port, (innerErr, url) => {
      if (innerErr) {
        return logger.error(innerErr)
      }

      logger.appStarted(port, prettyHost, url)
    })
  } else {
    logger.appStarted(port, prettyHost)
  }
})
