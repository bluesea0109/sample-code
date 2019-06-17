import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { COLORS } from 'utils/globalConstants'
import './style.scss'

class ScoreBoard extends Component {
  static propTypes = {
    recommendations: PropTypes.array,
    show: PropTypes.bool,
  }

  static defaultProps = {
    show: false,
  }

  render() {
    const { recommendations, show } = this.props
    return (
      <div className={cx({ scoreBoard: true, hidden: !show })}>
        {recommendations.map((recommendation, index) => {
          const { name, score } = recommendation
          return (
            <div key={index} style={{ color: COLORS[index % 5] }}>
              {name} : {score}
            </div>
          )
        })}
      </div>
    )
  }
}

export default ScoreBoard
