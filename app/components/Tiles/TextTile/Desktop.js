import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Col } from 'reactstrap'
import cx from 'classnames'
import './style.scss'

class TextTile extends Component {
  static propTypes = {
    title: PropTypes.string,
    content: PropTypes.string,
    type: PropTypes.string,
  }

  constructor(props) {
    super(props)

    this.state = { expanded: false }
  }

  componentDidMount() {
    const comp = ReactDOM.findDOMNode(this)
    $(comp)
      .find('.textTile__content')
      .dotdotdot({
        watch: 'window',
        ellipsis: ' ...',
      })

    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  handleClick = () => {
    this.setState({ expanded: false }, this.handleResize)
  }

  handleResize = () => {
    const tile = ReactDOM.findDOMNode(this)
    const { expanded } = this.state

    if (expanded) {
      $(tile).css({ zIndex: 20 })
      $(tile)
        .find('.textTile')
        .css({ bottom: 'calc(-100% - 8px)' })
    } else {
      $(tile)
        .find('.textTile')
        .css({ bottom: 0, zIndex: 1 })
    }

    setTimeout(() => {
      $(tile)
        .find('.textTile__content')
        .trigger('update.dot')
      $(tile)
        .find('.arrowBtn')
        .css('display', $(tile).find('.is-truncated').length > 0 || expanded ? 'block' : 'none')
    }, 200)

    if (!expanded) {
      setTimeout(() => {
        $(tile).css({ zIndex: 1 })
      }, 250)
    }
  }

  handleToggleExpand = () => {
    this.setState({ expanded: !this.state.expanded }, this.handleResize)
  }

  handleBackClick = () => {
    this.setState({ expanded: false }, this.handleResize)
  }

  render() {
    const { title, content, type } = this.props
    const { expanded } = this.state
    const props = type ? {} : { xs: 12, sm: 12, md: 6, lg: 4 }

    return (
      <Col className={cx({ descriptionText: type === 'description', tileCol: !type })} {...props}>
        {expanded && <div className="tileBackLayer" onClick={this.handleBackClick} />}
        <div
          className="tileContainer"
          onClick={evt => {
            evt.stopPropagation()
          }}
        >
          <div className="tile textTile">
            <h2 className="textTile__title">{title}</h2>
            <div className="textTile__content">{content}</div>
            <div className={cx({ arrowBtn: true, more: !expanded, less: expanded })} onClick={this.handleToggleExpand} />
          </div>
        </div>
      </Col>
    )
  }
}

export default TextTile
