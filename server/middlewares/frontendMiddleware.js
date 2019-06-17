/* eslint-disable global-require */
const express = require('express')
const path = require('path')
const compression = require('compression')
const pkg = require(path.resolve(process.cwd(), 'package.json'))

const authRoutes = require('../routes/auth.routes')
const importRoutes = require('../routes/import.routes')
const mapRoutes = require('../routes/map.routes')
const postRoutes = require('../routes/post.routes')
const suggestionRoutes = require('../routes/suggestion.routes')
const brochureRoutes = require('../routes/brochure.routes')
const placeRoutes = require('../routes/place.routes')
const themeRoutes = require('../routes/theme.routes')
const userRoutes = require('../routes/user.routes')
const wishlistRoutes = require('../routes/wishlist.routes')

// Add Routes
const addRoutes = app => {
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/import', importRoutes)
  app.use('/api/v1/map', mapRoutes)
  app.use('/api/v1/post', postRoutes)
  app.use('/api/v1/suggestion', suggestionRoutes)
  app.use('/api/v1/brochure', brochureRoutes)
  app.use('/api/v1/place', placeRoutes)
  app.use('/api/v1/theme', themeRoutes)
  app.use('/api/v1/user', userRoutes)
  app.use('/api/v1/wishlist', wishlistRoutes)
}

// Dev middleware
const addDevMiddlewares = (app, webpackConfig) => {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const compiler = webpack(webpackConfig)
  const middleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
    silent: true,
    stats: 'errors-only',
  })

  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))
  addRoutes(app)

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem

  if (pkg.dllPlugin) {
    app.get(/\.dll\.js$/, (req, res) => {
      const filename = req.path.replace(/^\//, '')
      res.sendFile(path.join(process.cwd(), pkg.dllPlugin.path, filename))
    })
  }

  app.get('*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404)
      } else {
        res.send(file.toString())
      }
    })
  })
}

// Production middlewares
const addProdMiddlewares = (app, options) => {
  const publicPath = options.publicPath || '/'
  const outputPath = options.outputPath || path.resolve(process.cwd(), 'build')

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique

  app.use(compression())
  app.use(publicPath, express.static(outputPath))
  addRoutes(app)

  app.get('*', (req, res) => res.sendFile(path.resolve(outputPath, 'index.html')))
}

/**
 * Front-end middleware
 */
module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd) {
    addProdMiddlewares(app, options)
  } else {
    const webpackConfig = require('../../internals/webpack/webpack.dev.babel')
    addDevMiddlewares(app, webpackConfig)
  }

  return app
}
