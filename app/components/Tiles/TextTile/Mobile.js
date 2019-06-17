import React, { Component, PropTypes } from 'react'
import { Col } from 'reactstrap'
import cx from 'classnames'
import './style.scss'

class TextTile extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.string,
    type: PropTypes.string,
  }

  render() {
    const { title, content, type } = this.props
    const props = type ? {} : { xs: 12, sm: 12, md: 6, lg: 4 }

    return (
      <Col className={cx({ descriptionText: type === 'description', tileCol: !type })} {...props}>
        <div className="tileContainer mobileTextTile">
          {title && <h2 className="textTile__title">{title}</h2>}
          <div className="textTile__content">{content}</div>
        </div>
      </Col>
    )
  }
}

export default TextTile
