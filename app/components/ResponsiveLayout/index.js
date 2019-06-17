import React, { Component, PropTypes } from 'react'
import MediaQuery from 'react-responsive'
import { DESKTOP_WIDTH, TABLET_WIDTH } from 'utils/globalConstants'

class ResponsiveLayout extends Component {
  static propTypes = {
    desktop: PropTypes.node.isRequired,
    tablet: PropTypes.node,
    mobile: PropTypes.node,
  }
  render() {
    const { desktop, tablet, mobile } = this.props
    return (
      <MediaQuery maxWidth={TABLET_WIDTH - 1}>
        {isMobile => {
          if (isMobile) {
            return mobile
          } else {
            return <MediaQuery maxWidth={DESKTOP_WIDTH - 1}>{isTablet => (isTablet ? tablet : desktop)}</MediaQuery>
          }
        }}
      </MediaQuery>
    )
  }
}

export default ResponsiveLayout
