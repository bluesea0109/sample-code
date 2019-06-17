const PlaceCategory = require('../models/placeCategory')
const TypeCategory = require('../models/typeCategory')
const DescriptiveCategory = require('../models/descriptiveCategory')
const Element = require('../models/element')
const _ = require('lodash')

/**
 * Get quest info
 */
exports.getQuestInfo = (req, res) => {
  let questInfo = {
    places: [],
    types: [],
    descriptives: [],
  }

  PlaceCategory.find({}, { _id: 0 }, (err, places) => {
    if (err) {
      return res.status(400).send({ error: { details: err.toString() } })
    }
    questInfo.places = places

    if (questInfo.places.length > 0 && questInfo.descriptives.length > 0 && questInfo.types.length > 0) {
      return res.json(questInfo)
    }
  })

  TypeCategory.find({ display: 1 }, { _id: 0, name: 0, e: 0, sum: 0 }, (err, types) => {
    if (err) {
      return res.status(400).send({ error: { details: err.toString() } })
    }
    questInfo.types = types

    if (questInfo.places.length > 0 && questInfo.descriptives.length > 0 && questInfo.types.length > 0) {
      return res.json(questInfo)
    }
  })

  DescriptiveCategory.find({}, { _id: 0, name: 0, e: 0, sum: 0 }, (err, descriptives) => {
    if (err) {
      return res.status(400).send({ error: { details: err.toString() } })
    }
    questInfo.descriptives = descriptives

    if (questInfo.places.length > 0 && questInfo.descriptives.length > 0 && questInfo.types.length > 0) {
      return res.json(questInfo)
    }
  })
}

/**
 * Get recommendations
 */
exports.getRecommendations = (req, res) => {
  const { viewport, types, descriptives } = req.body
  let typeMatch = []

  types.includes.map(type => {
    let typeSearch = {}
    typeSearch[`type.${type}`] = '1'
    typeMatch.push(typeSearch)
  })

  let typeProject = { sum: 1 }

  types.includes.map(type => {
    typeProject[type] = 1
  })

  types.excludes.map(type => {
    typeProject[type] = 1
  })

  let descriptiveProject = { sum: 1, rep: 1 }

  descriptives.stars.map(star => {
    descriptiveProject[star] = 1
  })

  if (descriptives.all) {
    descriptives.excludes.map(desc => {
      descriptiveProject[desc] = 1
    })
  } else {
    descriptives.includes.map(desc => {
      descriptiveProject[desc] = 1
    })
  }

  const pipeline = [
    {
      $match: {
        zmin: { $lte: viewport.zoom },
        zmax: { $gte: viewport.zoom },
        x: { $gte: viewport.bounds._sw.lng, $lte: viewport.bounds._ne.lng },
        y: { $gte: viewport.bounds._sw.lat, $lte: viewport.bounds._ne.lat },
      },
    },
    {
      $lookup: {
        from: 'elementTypeRelation',
        localField: 'e',
        foreignField: 'e',
        as: 'type',
      },
    },
    {
      $lookup: {
        from: 'elementDescriptiveRelation',
        localField: 'e',
        foreignField: 'e',
        as: 'descriptive',
      },
    },
    {
      $unwind: '$type',
    },
    {
      $unwind: '$descriptive',
    },
    {
      $match: {
        $or: typeMatch,
      },
    },
    {
      $sort: {
        reputation: -1,
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        e: 1,
        feature: 1,
        icon: 1,
        x: 1,
        y: 1,
        type: typeProject,
        descriptive: descriptiveProject,
      },
    },
  ]

  Element.aggregate(pipeline, (err, elements) => {
    if (err) {
      return res.status(400).send({ error: { details: err.toString() } })
    }

    let scoreElements = elements.map(element => {
      let tScore = 0
      let dScore = 0

      if (!types.all) {
        types.includes.map(type => {
          tScore += parseFloat(element.type[type])
        })
      } else {
        tScore += parseFloat(element.type.sum)

        types.excludes.map(type => {
          tScore -= parseFloat(element.type[type])
        })
      }

      if (!descriptives.all) {
        descriptives.stars.map(star => {
          dScore += parseFloat(element.descriptive[star]) * 1
        })

        descriptives.includes.map(desc => {
          dScore += parseFloat(element.descriptive[desc]) * 0.3
        })
      } else {
        dScore += parseFloat(element.descriptive.sum) * 0.3

        descriptives.stars.map(star => {
          dScore += parseFloat(element.descriptive[star]) * 0.7
        })

        descriptives.excludes.map(desc => {
          dScore += parseFloat(element.descriptive[desc]) * -0.3
        })
      }

      element.score = tScore * parseFloat(element.descriptive.rep) * (1 + dScore)

      return element
    })

    let sortedElements = scoreElements.sort((first, second) => {
      return parseFloat(second.score - first.score)
    })

    let recommendations = []

    for (element of sortedElements) {
      if (element.score > 0) {
        const recommendation = _.pick(element, ['e', 'feature', 'score', 'icon', 'name'])

        recommendations.push(recommendation)
        if (recommendations.length >= 5) {
          break
        }
      }
    }

    return res.json(recommendations)
  })
}

/**
 * Get descriptive categories based on type category selection
 */

exports.getDescriptiveCategories = (req, res) => {
  const { types: { all, includes, excludes } } = req.body

  if (all && excludes.length === 0) {
    const pipeline = [
      {
        $lookup: {
          from: 'typeDescriptiveRelation',
          localField: 'd',
          foreignField: 'd',
          as: 'relation',
        },
      },
      {
        $unwind: '$relation',
      },
      {
        $sort: {
          'relation.sum': -1,
        },
      },
      {
        $project: {
          _id: 0,
          d: 1,
          nl: 1,
          en: 1,
        },
      },
    ]
    DescriptiveCategory.aggregate(pipeline, (err, descriptives) => {
      if (err) {
        return res.status(400).send({ error: { details: err.toString() } })
      }
      return res.json(descriptives)
    })
  } else if (includes.length > 0) {
    let descsList = []

    for (let type of includes) {
      const pipeline = [
        {
          $lookup: {
            from: 'typeDescriptiveRelation',
            localField: 'd',
            foreignField: 'd',
            as: 'relation',
          },
        },
        {
          $unwind: '$relation',
        },
        {
          $sort: {
            [`relation.${type}`]: -1,
          },
        },
        {
          $project: {
            _id: 0,
            d: 1,
            nl: 1,
            en: 1,
          },
        },
      ]
      DescriptiveCategory.aggregate(pipeline, (err, elements) => {
        if (err) {
          return res.status(400).send({ error: { details: err.toString() } })
        }
        descsList.push({ index: type.substring(1), lists: elements })
        if (descsList.length === includes.length) {
          descsList = _.map(_.orderBy(descsList, ['index'], ['asc']), 'lists')
          let descriptives = []
          const len = descsList.length
          while (true) {
            for (let i = 0; i < len; i += 1) {
              const desc = _.pullAt(descsList[i], [0])

              if (_.findIndex(descriptives, desc[0]) === -1) {
                descriptives.push(desc[0])
              }
            }
            if (descsList[len - 1].length === 0) {
              break
            }
          }
          return res.json(descriptives)
        }
      })
    }
  } else {
    return res.json([])
  }
}
