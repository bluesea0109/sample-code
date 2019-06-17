import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { browserHistory } from 'react-router'
import { Col } from 'reactstrap'
import Img from 'components/Img'
import { TABLET_WIDTH } from 'utils/globalConstants'
import './style.scss'

class PlaceTile extends Component {
  static propTypes = {
    title: PropTypes.string,
    url: PropTypes.string,
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
    const placeTile = ReactDOM.findDOMNode(this)
    const width = $(placeTile).width()
    const fontSize = width / 44 * 3 * 1.35 * (window.innerWidth < TABLET_WIDTH ? 7 / 6 : 1)
    $(placeTile)
      .find('h2')
      .css({ fontSize: `${fontSize}px` })
  }

  handleLoaded = () => {
    this.setState({ imageLoaded: true }, this.handleResize)
  }

  handleTileClick = () => {
    const { link } = this.props
    browserHistory.push(`/in/${link}`)
  }

  render() {
    const { imageLoaded } = this.state
    const { url, title } = this.props

    return (
      <Col className="tileCol" xs={12} sm={12} md={6} lg={4}>
        <div className="tileContainer" onClick={this.handleTileClick}>
          <div className="tile placeTile">
            <Img onLoad={this.handleLoaded} src={url} />
            {imageLoaded && <h2 dangerouslySetInnerHTML={{ __html: title }} />}
          </div>
        </div>
      </Col>
    )
  }
}

export default PlaceTile
