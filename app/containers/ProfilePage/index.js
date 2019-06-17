import React, { Component, PropTypes } from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Container, Row } from 'reactstrap'
import { PlaceTile } from 'components/Tiles'
import { selectProfile } from './selectors'
import { getProfileRequest } from './actions'
import './style.scss'

class ProfilePage extends Component {
  static propTypes = {
    getProfileRequest: PropTypes.func,
    profile: PropTypes.array,
    params: PropTypes.object,
  }
  componentWillMount() {
    const { getProfileRequest, params: { username } } = this.props
    getProfileRequest(username)
  }
  render() {
    const { profile } = this.props
    return (
      <Container fluid className="profilePage">
        <Helmet meta={[{ name: 'Profile', content: 'Carta' }]} />
        <Row className="profilePage__row">{profile && profile.map((entry, index) => <PlaceTile key={index} {...entry} />)}</Row>
      </Container>
    )
  }
}

const selectors = createStructuredSelector({
  profile: selectProfile(),
})

const actions = {
  getProfileRequest,
}

export default connect(selectors, actions)(ProfilePage)
