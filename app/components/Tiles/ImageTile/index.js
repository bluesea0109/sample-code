import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Col } from 'reactstrap'
import cx from 'classnames'
import Img from 'components/Img'
import { TABLET_WIDTH } from 'utils/globalConstants'
import './style.scss'

class ImageTile extends Component {
  static propTypes = {
    img: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    source: PropTypes.string,
    link: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = { imageLoaded: false }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    const imageTile = ReactDOM.findDOMNode(this)
    const width = $(imageTile).width()
    const fontSize = width / 44 * 3 * 1.35 * (window.innerWidth < TABLET_WIDTH ? 7 / 6 : 1)
    $(imageTile)
      .find('h2')
      .css({ fontSize: `${fontSize}px` })
  }

  handleLoaded = () => {
    this.setState({ imageLoaded: true }, this.handleResize)
  }

  render() {
    const { imageLoaded } = this.state
    const { img, title, type, source, link } = this.props
    const props = type ? {} : { xs: 12, sm: 12, md: 6, lg: 4 }

    return (
      <Col className={cx({ descriptionPoster: type === 'description', tileCol: !type })} {...props}>
        <div className="tileContainer">
          <a href={type === 'description' ? link : ''} className="tile imageTile" target="_blank">
            <Img onLoad={this.handleLoaded} src={img} />
            {imageLoaded && <h2 dangerouslySetInnerHTML={{ __html: title }} />}
            {type === 'description' && <div className="imageTile__source" dangerouslySetInnerHTML={{ __html: `More on <b>${source}</b>` }} />}
          </a>
        </div>
      </Col>
    )
  }
}

export default ImageTile
