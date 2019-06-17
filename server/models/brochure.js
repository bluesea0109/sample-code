const mongoose = require('mongoose')
const Schema = mongoose.Schema

const brochureSchema = new Schema(
  {
    e: Number,
    name: String,
    slides: Number,
    descriptionText: String,
    descriptionLength: Number,
    descriptionSource: String,
    descriptionLink: String,
    descriptionRelevance: String,
    bizwindowTitle: String,
    bizwindowImage: String,
    bizwindowAlt: String,
    bizwindowReference: String,
    bizwindowLink: String,
  },
  { strict: false, versionKey: false }
)

module.exports = mongoose.model('Brochure', brochureSchema, 'brochure')
