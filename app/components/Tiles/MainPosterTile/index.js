import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Col } from 'reactstrap'
import cx from 'classnames'
import Img from 'components/Img'
import { MainPosterButton } from 'components/Buttons'
import { TABLET_WIDTH } from 'utils/globalConstants'

import './style.scss'

class MainPosterTile extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    type: PropTypes.string,
    link: PropTypes.string,
    name: PropTypes.string,
    slides: PropTypes.number,
  }

  constructor(props) {
    super(props)

    const { type, link } = props
    let imageLoaded

    if (type === 'image' || type === 'video') {
      imageLoaded = !link
    } else {
      imageLoaded = true
    }

    this.state = { imageLoaded }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    const isMobile = window.innerWidth < TABLET_WIDTH
    const mainPosterTile = ReactDOM.findDOMNode(this)
    const width = $(mainPosterTile).width()
    const fontSize = width / 44 * 3 * 1.35 * (isMobile ? 7 / 6 : 1)
    $(mainPosterTile)
      .find('h2')
      .css({ fontSize: `${fontSize}px` })
  }

  handleLoaded = () => {
    this.setState({ imageLoaded: true }, this.handleResize)
  }

  render() {
    const { imageLoaded } = this.state
    const { type, link, name, slides, onClick } = this.props

    return (
      <Col className={cx({ mainPoster: true, 'Cr-P': !!link })} onClick={onClick}>
        <div className="tileContainer">
          {type === 'panorama' ? (
            <div className="tile mainPosterTile">
              <iframe className="mainPosterTile__panorama" frameBorder="0" src={`${link}`} />
              <h2 className="mainPosterTile__name" dangerouslySetInnerHTML={{ __html: name }} />
              <MainPosterButton className="mainPosterTile__button" imageName="full.png" onClick={onClick} />
            </div>
          ) : (
            <div className="tile mainPosterTile">
              {link && <Img className="mainPosterTile__img" onLoad={this.handleLoaded} src={link} />}
              {imageLoaded && <h2 className="mainPosterTile__name" dangerouslySetInnerHTML={{ __html: name }} />}
              {type === 'image' && <div className="mainPosterTile__slides">{slides}</div>}
              <MainPosterButton
                className="mainPosterTile__button"
                imageName={type === 'video' ? 'play-simple.png' : 'slides.png'}
                onClick={onClick}
              />
            </div>
          )}
        </div>
      </Col>
    )
  }
}

export default MainPosterTile
