import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { injectIntl, intlShape } from 'react-intl'
import { connect } from 'react-redux'
import cx from 'classnames'
import { createStructuredSelector } from 'reselect'
import { LANGUAGES, LANGUAGE_CONST } from 'containers/LanguageProvider/constants'
import { createPostRequest } from 'containers/HomePage/actions'
import { CREATE_POST_REQUEST, CREATE_POST_SUCCESS } from 'containers/HomePage/constants'
import messages from 'containers/HomePage/messages'
import { selectHomeInfo } from 'containers/HomePage/selectors'
import { DeleteButton, InfoButton, LinkButton, RemoveButton } from 'components/Buttons'
import Img from 'components/Img'
import LoadingSpinner from 'components/LoadingSpinner'
import Resizable from 'components/Resizable'
import { QuarterSpinner } from 'components/SvgIcon'
import { S3_ICON_URL, S3_POST_IMAGE_URL } from 'utils/globalConstants'
import { getCroppedImage, imageUploader } from 'utils/imageHelper'
import { getDefaultTexts, getSubmitInfo, isLanguageSelectable } from 'utils/stringHelper'
import './style.scss'

class PostCreate extends Component {
  static propTypes = {
    onClose: PropTypes.func,
    createPostRequest: PropTypes.func,
    user: PropTypes.object,
    info: PropTypes.object,
    show: PropTypes.bool,
    intl: intlShape.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      img: null,
      content: null,
      title: LANGUAGE_CONST,
      link: '',
      showInfo: false,
      showLinkBar: false,
      showDeleteConfirm: false,
      imageUpload: {
        uploading: false,
        error: null,
      },
      locale: props.intl.locale,
      showError: false,
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillReceiveProps(nextProps) {
    const { info: { status } } = nextProps
    if (status === CREATE_POST_SUCCESS) {
      this.setState({
        img: null,
        content: null,
        title: '',
        link: '',
        showInfo: false,
        showLinkBar: false,
        showDeleteConfirm: false,
        showError: false,
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleResize = () => {
    const comp = ReactDOM.findDOMNode(this)
    const post = $(comp).find('.post')
    const width = $(comp).width()

    if ($(post).hasClass('textPost')) {
      const fontSize = width / 76 * 3 * 1.15
      $(post)
        .find('.postTitleEdit')
        .css({
          fontSize: `${fontSize}px`,
        })
    } else {
      const height =
        $(post)
          .find('.postImage')
          .height() - ($(post).hasClass('mediaPost') ? 90 : 60)
      const fontSize = width / 44 * 3 * 1.15
      let lines = fontSize > 0 ? Math.floor(height / (fontSize * 1.2)) : 0

      $(post)
        .find('.postTitleEdit')
        .css({
          fontSize: `${fontSize}px`,
          'max-height': `${fontSize * lines * 1.2}px`,
        })
    }
  }

  handleAddMedia = () => {
    this.mediaUploader.click()
  }

  handleAddText = () => {
    this.setState(
      {
        content: LANGUAGE_CONST,
        showError: false,
      },
      () => {
        this.handleResize()
        const comp = ReactDOM.findDOMNode(this)
        if ($(comp).find('.postImage').length > 0) {
          $(comp)
            .find('.postText')
            .focus()
        } else {
          $(comp)
            .find('.postTitleEdit')
            .focus()
        }
      }
    )
  }

  handleFiles = evt => {
    const file = evt.target.files[0]
    getCroppedImage(file, this.handleImage, 'landscape')
  }

  handleImage = img => {
    this.setState({ img, showError: false }, () => {
      this.handleResize()
      const comp = ReactDOM.findDOMNode(this)
      $(comp)
        .find('.postTitleEdit')
        .focus()
    })
  }

  handleCancel = () => {
    const { onClose } = this.props
    this.setState(
      {
        img: null,
        title: null,
        content: null,
        link: null,
        showError: false,
      },
      () => {
        this.handleResize()
        onClose()
      }
    )
  }

  handlePostContent = value => {
    const { content, locale } = this.state
    this.setState({
      content: {
        ...content,
        [locale]: value,
      },
      showError: false,
    })
  }

  handleDelete = () => {
    this.setState({ showDeleteConfirm: !this.state.showDeleteConfirm })
  }

  handleDeleteConfirm = () => {
    this.handleCancel()
  }

  handlePostLinkBtn = evt => {
    evt.stopPropagation()
    this.setState({ showLinkBar: !this.state.showLinkBar })
  }

  handlePostImageRemove = () => {
    this.setState({ img: null, showError: false }, () => {
      this.handleResize()
      const comp = ReactDOM.findDOMNode(this)
      $(comp)
        .find('.postText')
        .focus()
    })
  }

  handlePostContentRemove = () => {
    this.setState({ content: null, showError: false }, () => {
      this.handleResize()
      const comp = ReactDOM.findDOMNode(this)
      $(comp)
        .find('.postTitleEdit')
        .focus()
    })
  }

  handleSubmit = submitError => {
    if (submitError) {
      this.setState({ showError: true })
      return
    }

    this.setState({ showError: false })

    const { content, img, title, link } = this.state
    const { createPostRequest, user } = this.props

    let data = {
      link,
      author: user._id,
      content: content,
      title: title,
      img: '',
    }

    if (img) {
      this.setState({ imageUpload: { uploading: true, error: null } })
      imageUploader(S3_POST_IMAGE_URL, img, (err, url) => {
        if (err) {
          this.setState({
            imageUpload: { uploading: false, error: err.toString() },
          })
        } else {
          data.img = url
          createPostRequest(data)
          this.setState({ imageUpload: { uploading: false, error: null } })
        }
      })
    } else {
      createPostRequest(data)
    }
  }

  handlePostInfoToggle = evt => {
    evt.stopPropagation()
    this.setState({
      showInfo: !this.state.showInfo,
      showError: false,
    })
  }

  handlePostTitle = value => {
    const { locale, title } = this.state
    this.setState({
      title: {
        ...title,
        [locale]: value,
      },
      showError: false,
    })
  }

  handlePostLinkBarClick = evt => {
    evt.stopPropagation()
  }

  handlePostLinkBarChange = evt => {
    evt.stopPropagation()
    this.setState({
      link: evt.target.value,
      showError: false,
    })
  }

  handlePostClick = () => {
    this.setState({
      showInfo: false,
      showLinkBar: false,
      showDeleteConfirm: false,
      showError: false,
    })
  }

  handlePostLanguageChange = evt => {
    this.setState({
      locale: evt.target.value,
      showError: false,
    })
  }

  handleEnterKey = evt => {
    if (evt.keyCode === 13) {
      this.setState({
        showLinkBar: false,
        showError: false,
      })
    }
  }

  render() {
    const { onClose, user: { fullname }, info: { status }, intl: { formatMessage }, intl } = this.props
    const { img, title, content, link, showInfo, showLinkBar, showDeleteConfirm, imageUpload, locale, showError } = this.state

    const defaultTexts = getDefaultTexts(locale, intl.locale)
    const showPostLinkButton = !showLinkBar
    const showImage = status !== CREATE_POST_REQUEST
    const spinnerShow = status === CREATE_POST_REQUEST || imageUpload.uploading
    const dropdownDisabled = !isLanguageSelectable(title, img, content, intl.locale)
    const { postType, remainCharCnts, submitError } = getSubmitInfo(title, img, content, intl.locale, locale, formatMessage)

    return (
      <div className="postContainer">
        {(showLinkBar || showInfo || showDeleteConfirm) && <div className="backLayer" onClick={this.handlePostClick} />}
        <LoadingSpinner show={spinnerShow}>
          <QuarterSpinner width={30} height={30} />
        </LoadingSpinner>
        {postType === 'mixedPost' && (
          <div className={cx({ post: true, postCreate: true, [postType]: true })} onClick={this.handlePostClick}>
            <div className="postImage">
              {showImage && <Img src={img} />}
              <div
                className={cx({
                  postLinkBar: true,
                  'postLinkBar--hidden': !showLinkBar,
                })}
                onClick={this.handlePostLinkBarClick}
              >
                <Img onClick={this.handlePostLinkBtn} src={`${S3_ICON_URL}/link.png`} />
                <input type="text" value={link} placeholder={formatMessage(messages.linkMessage)} onKeyDown={this.handleEnterKey} onChange={this.handlePostLinkBarChange} />
              </div>
              <Resizable className="postTitleEdit" tabIndex={1} placeholder={defaultTexts.title} onChange={this.handlePostTitle} value={title[locale]} />
            </div>
            <div className="postContent">
              <RemoveButton type="content" onClick={this.handlePostContentRemove} />
              <div className="postMeta">
                {fullname} - CARTA | {formatMessage(messages.now)}
              </div>
              <Resizable className="postText" tabIndex={2} placeholder={defaultTexts.content} onChange={this.handlePostContent} value={content[locale]} />
            </div>
            <RemoveButton type="image" onClick={this.handlePostImageRemove} />
            {showPostLinkButton && <LinkButton onClick={this.handlePostLinkBtn} />}
          </div>
        )}

        {postType === 'mediaPost' && (
          <div className={cx({ post: true, postCreate: true, [postType]: true })} onClick={this.handlePostClick}>
            <div className="postImage">
              {showImage && <Img src={img} />}
              <RemoveButton type="image" onClick={this.handlePostImageRemove} />
              {showPostLinkButton && <LinkButton onClick={this.handlePostLinkBtn} />}
              <div
                className={cx({
                  postLinkBar: true,
                  'postLinkBar--hidden': !showLinkBar,
                })}
                onClick={this.handlePostLinkBarClick}
              >
                <Img onClick={this.handlePostLinkBtn} src={`${S3_ICON_URL}/link.png`} />
                <input type="text" value={link} placeholder={formatMessage(messages.linkMessage)} onKeyDown={this.handleEnterKey} onChange={this.handlePostLinkBarChange} />
              </div>
            </div>
            <Resizable className="postTitleEdit" placeholder={defaultTexts.title} onChange={this.handlePostTitle} value={title[locale]} />
            <div className={cx({ postInfo: true, 'postInfo--hidden': !showInfo })}>
              {fullname} - Carta | {formatMessage(messages.now)}
            </div>
            <InfoButton active={showInfo} onClick={this.handlePostInfoToggle} />
          </div>
        )}

        {postType === 'textPost' && (
          <div className={cx({ post: true, postCreate: true, [postType]: true })} onClick={this.handlePostClick}>
            <Resizable className="postTitleEdit" tabIndex={1} placeholder={defaultTexts.title} onChange={this.handlePostTitle} value={title[locale]} />
            <div className="postContent">
              <RemoveButton type="content" onClick={this.handlePostContentRemove} />
              <div className="postMeta">
                {fullname} - CARTA | {formatMessage(messages.now)}
              </div>
              <Resizable className="postText" tabIndex={2} placeholder={defaultTexts.content} onChange={this.handlePostContent} value={content[locale]} />
            </div>
          </div>
        )}

        <div className="postButtons postCreate">
          <div className="left">
            <input
              type="file"
              ref={ref => {
                this.mediaUploader = ref
              }}
              accept="image/*"
              onChange={this.handleFiles}
            />
            {(postType === 'textPost' || postType === 'mixedPost') && <span style={{ marginRight: '4px' }}>{remainCharCnts >= 0 ? remainCharCnts : 0}</span>}
            {postType !== 'mediaPost' &&
              postType !== 'mixedPost' && (
                <button type="button" className="postBorderBtn" onClick={this.handleAddMedia}>
                  + {formatMessage(messages.picture)}
                </button>
              )}
            {postType !== 'textPost' &&
              postType !== 'mixedPost' && (
                <button type="button" className="postBorderBtn" onClick={this.handleAddText}>
                  + {formatMessage(messages.text)}
                </button>
              )}
            {postType && (
              <div className={cx({ postLang: true, disabled: dropdownDisabled })}>
                <select onChange={this.handlePostLanguageChange} disabled={dropdownDisabled} value={locale}>
                  {LANGUAGES.map(lang => (
                    <option key={lang.countryCode} value={lang.countryCode}>
                      {lang.countryCode}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {postType && (
            <div className="right">
              <button type="button" className="postCancelBtn" onClick={this.handleCancel}>
                {formatMessage(messages.cancel)}
              </button>
              <DeleteButton onClick={this.handleDelete} onConfirm={this.handleDeleteConfirm} showConfirm={showDeleteConfirm} />
              <button
                type="button"
                className={cx({ postBorderBtn: true, disabled: submitError })}
                title={submitError}
                onClick={() => {
                  this.handleSubmit(submitError)
                }}
              >
                {formatMessage(messages.submit)}
              </button>
            </div>
          )}
          <button
            type="button"
            className={cx({
              postCloseBtn: true,
              'postCloseBtn--hasContent': postType,
            })}
            onClick={onClose}
          >
            <Img src={`${S3_ICON_URL}/close.png`} />
          </button>
        </div>
        {showError && submitError && <div className="error">{submitError}</div>}
      </div>
    )
  }
}

const selectors = createStructuredSelector({
  info: selectHomeInfo(),
})

const actions = {
  createPostRequest,
}

export default injectIntl(connect(selectors, actions)(PostCreate))
