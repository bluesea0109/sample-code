const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY, process.env.CRYPTR_ALGORITHM)
const ses = require('nodemailer-ses-transport')
const _ = require('lodash')
const Post = require('../models/post')
const User = require('../models/user')
const Follow = require('../models/follow')
const Wishlist = require('../models/wishlist')

const transporter = nodemailer.createTransport(
  ses({
    accessKeyId: process.env.NODEMAILER_ACCESS_KEY_ID,
    secretAccessKey: process.env.NODEMAILER_SECRET_ACCESS_KEY,
    region: process.env.NODEMAILER_REGION,
  })
)

/**
 * SignIn user
 */
exports.signIn = (req, res) => {
  const { email, password } = req.body

  User.find({ email }, (err, element) => {
    if (element.length > 0) {
      if (element[0].password === cryptr.encrypt(password)) {
        const user = _.pick(element[0], ['_id', 'fullname', 'username', 'email', 'role', 'profilePic', 'holidayPic', 'verified'])
        const pipeline = [
          {
            $lookup: {
              from: 'brochure',
              localField: 'brochureID',
              foreignField: '_id',
              as: 'brochure',
            },
          },
          {
            $unwind: '$brochure',
          },
          {
            $match: {
              userID: user._id,
            },
          },
          {
            $project: {
              _id: 1,
              userID: 1,
              brochureID: 1,
              quest: 1,
              e: 1,
              brochure: {
                name: 1,
                info: { mainPoster: { url: 1 } },
              },
            },
          },
        ]

        Wishlist.aggregate(pipeline, (err, result) => {
          if (err) {
            return res.status(400).send({ error: { details: err.toString() } })
          }
          const wishlist = result.map(entry => ({
            id: entry._id,
            userID: entry.userID,
            brochureID: entry.brochureID,
            quest: entry.quest,
            e: entry.e,
            title: entry.brochure.name,
            url: entry.brochure.info.mainPoster.url,
          }))
          return res.json({ user, wishlist })
        })
      } else {
        return res.status(400).send({ error: { details: 'carta.incorrectPassword' } })
      }
    } else {
      return res.status(400).send({ error: { details: 'carta.incorrectEmail' } })
    }
  })
}

/**
 * Register user
 */
exports.register = (req, res) => {
  const { fullname, email, role, profilePic, holidayPic, password, confirmPassword } = req.body

  if (password !== confirmPassword) {
    return res.status(400).send({ error: { details: 'carta.passwordNotEqual' } })
  }

  let data = {
    fullname,
    email,
    role,
    profilePic,
    holidayPic,
    verified: false,
    password: cryptr.encrypt(password),
  }

  const username = fullname.toLowerCase().replace(/ /g, '-')

  User.find({ username: RegExp(username) }, (err, elements) => {
    data.username = elements.length === 0 ? username : `${username}-${elements.length}`

    User.create(data, err => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          res.status(400).send({ error: { details: 'carta.alreadyRegistered' } })
        } else {
          return res.status(400).send({ error: { details: err.toString() } })
        }
      } else {
        const verifyUrl = process.env.NODE_ENV === 'development' ? `${process.env.LOCAL_API_URL}verify` : `${process.env.SERVER_API_URL}verify`
        const mailOptions = {
          from: '<Carta@carta.guide>',
          to: data.email,
          subject: 'Verify your email',
          text: `Hi, ${data.fullname}`,
          html: `Please verify your email by clicking <a href="${verifyUrl}/${cryptr.encrypt(data.email)}">this link</a>`,
        }
        transporter.sendMail(mailOptions, () => {
          return res.send(data)
        })
      }
    })
  })
}

/**
 * Update user
 */

exports.updateUser = (req, res) => {
  const { userID } = req.params

  User.findOneAndUpdate({ _id: userID }, { $set: req.body }, { new: true }, (err, element) => {
    if (element && element.fullname) {
      const response = _.pick(element, ['_id', 'fullname', 'username', 'email', 'role', 'profilePic', 'holidayPic', 'verified'])
      return res.json(response)
    }

    return res.status(400).send({ error: { details: 'Failed to update' } })
  })
}

/**
 * Verify user
 */

exports.verify = (req, res) => {
  const { vcode } = req.body

  let email
  try {
    email = cryptr.decrypt(vcode)
  } catch (e) {
    return res.status(400).send({ error: { details: 'Failed to verify' } })
  }

  User.findOneAndUpdate({ email }, { $set: { verified: true } }, { new: true }, (err, element) => {
    if (element && element.fullname) {
      let response = _.pick(element, ['_id', 'fullname', 'username', 'email', 'role', 'profilePic', 'holidayPic'])
      response.verified = true
      return res.json(response)
    }

    return res.status(400).send({ error: { details: 'Failed to verify' } })
  })
}

/**
 * Delete user
 */

exports.deleteUser = (req, res) => {
  const { userID } = req.params
  const { password } = req.body

  User.findOne({ _id: userID, password: cryptr.encrypt(password) }, (err, element) => {
    if (err || !element) {
      return res.status(400).send({ error: { details: err ? err.toString() : 'Password is not correct' } })
    }

    User.remove({ _id: userID }, err => {
      if (err) {
        return res.status(400).send({ error: { details: err.toString() } })
      }
      Post.remove({ author: mongoose.Types.ObjectId(userID) }, err => {
        if (err) {
          return res.status(400).send({ error: { details: err.toString() } })
        }
        Follow.remove(
          {
            $or: [{ follower: userID }, { followed: userID }],
          },
          err => {
            if (err) {
              return res.status(400).send({ error: { details: err.toString() } })
            }
            return res.json({})
          }
        )
      })
    })
  })
}
