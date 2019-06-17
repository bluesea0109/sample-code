const mongoose = require('mongoose')
const Schema = mongoose.Schema

const brochureImageSchema = new Schema(
  {
    e: Number,
    nr: Number,
    id: String,
    name: String,
    alt: String,
    creator: String,
    link: String,
    license: String,
    licLink: String,
  },
  { strict: false, versionKey: false }
)

module.exports = mongoose.model('BrochureImage', brochureImageSchema, 'brochureImage')
