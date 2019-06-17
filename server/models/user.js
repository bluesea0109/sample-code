const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    fullname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    profilePic: String,
    holidayPic: String,
    verified: Boolean,
  },
  { strict: false, versionKey: false }
)

module.exports = mongoose.model('User', userSchema, 'user')
