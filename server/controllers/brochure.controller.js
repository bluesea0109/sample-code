const Brochure = require('../models/brochure')
const BrochureImage = require('../models/brochureImage')
const _ = require('lodash')

/**
 * Get brochure
 */
exports.getBrochure = (req, res) => {
  const { link } = req.params

  Brochure.findOne({ link }, { _id: 0 }, (err, brochure) => {
    if (err || !brochure) {
      return res.status(400).send({ error: { details: err ? err.toString() : 'Wrong place' } })
    }

    BrochureImage.find({ e: brochure.e }, { _id: 0 }, { sort: { nr: 1 } }, (err, slides) => {
      const result = {
        ..._.pick(brochure, ['name', 'descriptionText', 'bizwindowTitle', 'bizwindowImage', 'bizwindowReference', 'bizwindowLink']),
        slides,
      }

      return res.json(result)
    })
  })
}
