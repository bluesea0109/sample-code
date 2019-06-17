const mongoose = require('mongoose')
const Schema = mongoose.Schema

const elementSchema = new Schema(
  {
    e: Number,
    name: String,
    label: String,
    reputation: Number,
    type: String,
    feature: String,
    icon: String,
    x: Number,
    y: Number,
    zmin: Number,
    zmax: Number,
    zoom: Number,
    hectares: Number,
    geokey: String,
    link: String,
    geosource: String,
    hide: String,
    scalerank: String,
    name_en: String,
  },
  { strict: false, versionKey: false }
)

module.exports = mongoose.model('Element', elementSchema, 'element')
