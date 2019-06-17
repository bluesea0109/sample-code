import React, { Component, PropTypes } from 'react'
import Img from 'components/Img'
import { S3_ICON_URL } from 'utils/globalConstants'

export default class PlayButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    imageName: PropTypes.string.isRequired,
    className: PropTypes.string,
  }

  handleClick = evt => {
    const { onClick } = this.props
    evt.stopPropagation()
    onClick()
  }

  render() {
    const { className, imageName } = this.props
    return (
      <button className={className} onClick={this.handleClick}>
        <Img src={`${S3_ICON_URL}/${imageName}`} />
        <Img className="hover" src={`${S3_ICON_URL}/${imageName}`} />
      </button>
    )
  }
}
