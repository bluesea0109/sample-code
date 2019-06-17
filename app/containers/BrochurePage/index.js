import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Container, Row, Col } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import { browserHistory, withRouter } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'
import Slider from 'react-image-gallery'
import 'react-image-gallery/styles/css/image-gallery.css'
import cx from 'classnames'
import { find } from 'lodash'
import { getUserWishlistRequest, createUserWishlistRequest, deleteUserWishlistRequest } from 'containers/App/actions'
import { CREATE_USER_WISHLIST_SUCCESS, DELETE_USER_WISHLIST_SUCCESS } from 'containers/App/constants'
import { selectAuthenticated, selectUserWishlist, selectUser, selectInfo } from 'containers/App/selectors'
import Img from 'components/Img'
import ResponsiveLayout from 'components/ResponsiveLayout'
import { ImageTile, MainPosterTile, TextTile, TextTileMobile } from 'components/Tiles'
import { S3_ICON_URL, S3_BROCHURE_IMAGE_URL } from 'utils/globalConstants'
import { getQuestUrl } from 'utils/urlHelper'
import { getBrochureRequest } from './actions'
import { selectBrochureDetail } from './selectors'
import messages from './messages'
import './style.scss'

class BrochurePage extends Component {
  static propTypes = {
    getBrochureRequest: PropTypes.func,
    getUserWishlistRequest: PropTypes.func,
    createUserWishlistRequest: PropTypes.func,
    deleteUserWishlistRequest: PropTypes.func,
    params: PropTypes.object,
    location: PropTypes.object,
    info: PropTypes.object,
    user: PropTypes.object,
    brochureDetail: PropTypes.object,
    authenticated: PropTypes.bool,
    wishlist: PropTypes.array,
    intl: intlShape.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      message: null,
      showMessage: false,
      showSlider: false,
    }
  }

  componentWillMount() {
    const { authenticated, getUserWishlistRequest, getBrochureRequest, params: { link } } = this.props
    if (authenticated) {
      getUserWishlistRequest()
    }
    getBrochureRequest(link)
  }

  componentWillReceiveProps(nextProps) {
    const { info: { status } } = nextProps
    if (status === CREATE_USER_WISHLIST_SUCCESS) {
      this.showMessage(messages.addedToWishlist)
    } else if (status === DELETE_USER_WISHLIST_SUCCESS) {
      this.showMessage(messages.removedFromWishlist)
    }
  }

  componentWillUnmount() {
    if (this.timerID) {
      clearTimeout(this.timerID)
    }
  }

  getSlides = () => {
    const { brochureDetail: { slides } } = this.props
    return slides.map(slide => ({
      original: `${S3_BROCHURE_IMAGE_URL}/${slide.id}.jpg`,
    }))
  }

  getMainPosterProps = () => {
    const { brochureDetail: { slides, name } } = this.props

    let mainPoster = find(slides, { nr: 0 })

    if (mainPoster) {
      return {
        type: 'panorama',
        link: mainPoster.link,
        title: name,
        slides: slides.length,
        onClick: this.handleMainPosterClick,
      }
    }

    mainPoster = find(slides, { nr: 1 })

    return {
      type: 'image',
      link: `${S3_BROCHURE_IMAGE_URL}/square/${mainPoster.id}.jpg`,
      name: name,
      slides: slides.length,
      onClick: this.handleMainPosterClick,
    }
  }

  isAlreadyonWishlist = () => {
    const { authenticated, user, wishlist, brochureDetail: { _id } } = this.props
    return !(!authenticated || !find(wishlist, { userID: user._id, brochureID: _id }))
  }

  handleBrochureClose = () => {
    browserHistory.push(getQuestUrl())
  }

  handleBrochureAddtoWishlist = alreadyExist => {
    const {
      authenticated,
      user,
      brochureDetail: { _id, e },
      location: { pathname },
      createUserWishlistRequest,
      deleteUserWishlistRequest,
    } = this.props
    if (!authenticated) {
      this.showMessage(messages.createWishlist)
    } else if (alreadyExist) {
      deleteUserWishlistRequest({ userID: user._id, brochureID: _id })
    } else {
      createUserWishlistRequest({ userID: user._id, brochureID: _id, quest: pathname, e })
    }
  }

  handleClickMessage = () => {
    const { authenticated, user } = this.props

    if (!authenticated) {
      browserHistory.push('/')
    } else {
      browserHistory.push(`/user/${user.username}/wishlist`)
    }
  }

  handleMainPosterClick = () => {
    const { brochureDetail: { slides } } = this.props
    if (slides.length > 0) {
      this.setState({ showSlider: true })
    }
  }

  handleSliderImageLoad = evt => {
    const { target } = evt
    const { width, height } = target

    target.style.width = width > height ? 'auto' : '100%'
    target.style.height = width > height ? '100%' : 'auto'
  }

  showMessage = message => {
    const { intl: { formatMessage } } = this.props
    this.setState({ message: formatMessage(message), showMessage: true }, () => {
      if (this.timerID) {
        clearTimeout(this.timerID)
      }
      this.timerID = setTimeout(() => {
        this.setState({ showMessage: false })
      }, 3000)
    })
  }

  render() {
    const { message, showMessage, showSlider } = this.state
    const { brochureDetail } = this.props

    if (!brochureDetail) return null

    const { descriptionText, bizwindowTitle, bizwindowImage, bizwindowReference, bizwindowLink } = brochureDetail
    const alreadyExist = this.isAlreadyonWishlist()
    const mainPosterProps = this.getMainPosterProps()
    const slides = this.getSlides()

    return (
      <Container fluid className="brochure">
        {showSlider ? (
          <div className="brochure__slider">
            <Slider
              items={slides}
              showThumbnails={false}
              showPlayButton={false}
              showBullets={false}
              showFullscreenButton={false}
              onImageLoad={this.handleSliderImageLoad}
              lazyLoad
            />
          </div>
        ) : (
          <div>
            <div className="brochure__menu">
              <h2 className={cx({ brochure__message: true, 'brochure__message--hidden': !showMessage })} onClick={this.handleClickMessage}>
                {message}
              </h2>
              <button
                onClick={() => {
                  this.handleBrochureAddtoWishlist(alreadyExist)
                }}
              >
                <Img src={alreadyExist ? `${S3_ICON_URL}/star-red.png` : `${S3_ICON_URL}/star-stroke.png`} style={{ marginTop: '-3px' }} />
              </button>
              <button onClick={this.handleBrochureClose}>
                <Img src={`${S3_ICON_URL}/close.png`} />
              </button>
            </div>
            <Row className="brochure__row">
              <Col lg={8} md={12} sm={12} xs={12} className="brochure__col">
                <MainPosterTile {...mainPosterProps} />
              </Col>
              <Col lg={4} md={12} sm={12} xs={12} className="brochure__col">
                <Row className="brochure__row">
                  <Col lg={12} md={6} sm={12} xs={12} className="brochure__col">
                    <ResponsiveLayout
                      desktop={<TextTile type="description" title={''} content={descriptionText} />}
                      tablet={<TextTile type="description" title={''} content={descriptionText} />}
                      mobile={<TextTileMobile type="description" title={''} content={descriptionText} />}
                    />
                  </Col>
                  <Col lg={12} md={6} sm={12} xs={12} className="brochure__col">
                    <ImageTile
                      type="description"
                      img={`${S3_BROCHURE_IMAGE_URL}/square/${bizwindowImage}.jpg`}
                      title={bizwindowTitle}
                      source={bizwindowReference}
                      link={bizwindowLink}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    )
  }
}

const selectors = createStructuredSelector({
  info: selectInfo(),
  user: selectUser(),
  wishlist: selectUserWishlist(),
  authenticated: selectAuthenticated(),
  brochureDetail: selectBrochureDetail(),
})

const actions = {
  getUserWishlistRequest,
  createUserWishlistRequest,
  deleteUserWishlistRequest,
  getBrochureRequest,
}

export default compose(withRouter, injectIntl, connect(selectors, actions))(BrochurePage)
