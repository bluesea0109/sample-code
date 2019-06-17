import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import cx from 'classnames'
import messages from 'containers/HomePage/messages'
import Img from 'components/Img'
import { S3_ICON_URL } from 'utils/globalConstants'

const LinkButton = ({ onClick, className, intl: { formatMessage } }) => (
  <button type="button" className={cx({ postLinkBtn: true, [className]: className })} onClick={onClick}>
    <div className="btnImage">
      <Img src={`${S3_ICON_URL}/link.png`} />
    </div>
    <div className="btnText">{formatMessage(messages.link)}</div>
  </button>
)

LinkButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  intl: intlShape.isRequired,
}

export default injectIntl(LinkButton)
