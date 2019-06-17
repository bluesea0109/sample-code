const mongoose = require('mongoose')
const Schema = mongoose.Schema

const typeCategorySchema = new Schema(
  {
    t: String,
    en: String,
    nl: String,
    display: Number,
  },
  { strict: false, versionKey: false }
)

module.exports = mongoose.model('TypeCategory', typeCategorySchema, 'typeCategory')
