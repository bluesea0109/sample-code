import React, { Component, PropTypes } from 'react'
import { browserHistory, withRouter } from 'react-router'
import ReactResizeDetector from 'react-resize-detector'
import { isEqual } from 'lodash'
import MapBox from 'mapbox-gl'
import { COLORS, S3_DATA_URL, MAP_ACCESS_TOKEN, MIN_ZOOM, MAX_ZOOM, TILE_SIZE } from 'utils/globalConstants'
import { urlComposer } from 'utils/urlHelper'
import './style.scss'

MapBox.accessToken = MAP_ACCESS_TOKEN

class Map extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    recommendations: PropTypes.array,
    viewport: PropTypes.object,
    params: PropTypes.object,
    wishlist: PropTypes.array,
    panelState: PropTypes.string,
    className: PropTypes.string,
    locale: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.state = {
      shapeLoaded: false,
      pointLoaded: false,
    }
  }

  componentDidMount() {
    const { center, zoom } = this.props.viewport

    this.mapStyle = {
      version: 8,
      center: [center.lng, center.lat],
      zoom,
      sources: {
        cartaSource: {
          type: 'raster',
          url: 'mapbox://cartaguide.white',
          tileSize: TILE_SIZE,
        },
      },
      layers: [
        {
          id: 'cartaSourceTiles',
          type: 'raster',
          source: 'cartaSource',
        },
      ],
      glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      sprite: 'mapbox://styles/cartaguide/cjdd9s5ojdgc12rlc5ghii409',
    }

    this.map = new MapBox.Map({
      container: 'map',
      style: this.mapStyle,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
      renderWorldCopies: false,
    })

    this.map.on('load', this.handleLoad)
    this.map.on('moveend', this.handleMapChange)
    this.map.on('zoomend', this.handleMapChange)
    this.map.on('touchend', this.handleMapChange)
  }

  componentWillReceiveProps(nextProps) {
    const { viewport } = this.props
    if (!isEqual(viewport, nextProps.viewport) && this.map) {
      const { viewport: { center, zoom } } = nextProps
      this.map.jumpTo({ center, zoom })
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.pointLoaded && nextState.shapeLoaded) {
      this.addWishlists(this.props.wishlist, nextProps.wishlist)
      this.addRecommendation(nextProps)
    }
  }

  componentWillUnmount() {
    this.map.remove()
  }

  addWishlists = (curList, nextList) => {
    curList.forEach(entry => {
      const id = `star-${entry.e}`
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id)
      }
    })

    nextList.forEach(entry => {
      this.Star(entry.e)
    })
  }

  addRecommendation = ({ recommendations, panelState }) => {
    this.clearMap(this.props.recommendations)

    if (panelState !== 'closed') {
      recommendations
        .slice()
        .reverse()
        .forEach((entry, index) => {
          const { e, feature } = entry
          const colorInd = (recommendations.length - index - 1) % COLORS.length
          if (feature !== 'point') {
            this.Shape({ e, index: colorInd })
          }
        })

      recommendations
        .slice()
        .reverse()
        .forEach((entry, index) => {
          const { e, icon } = entry
          const colorInd = (recommendations.length - index - 1) % COLORS.length
          this.Caption({ e, icon, index: colorInd })
        })
    }
  }

  Icons = ({ id, source, layer, filter, color, opacity, textsize, textfield, weight }) => {
    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
        'icon-opacity': opacity,
      },
      layout: {
        'text-size': textsize || 10,
        'text-field': textfield || `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
        'text-offset': [0, -1.5],
        'text-anchor': 'bottom',
        'icon-image': '{maki}',
        'icon-anchor': 'top',
        'icon-offset': [0, -15],
      },
    })
  }

  Roads = (source, layer, filter, color, weight) => {
    const id = '-road'
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source: 'mapbox',
      'source-layer': 'road_label',
      filter,
      minzoom: 12.5,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': 10,
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
        'symbol-placement': 'line',
        'symbol-spacing': 500,
      },
    })
  }

  Waterways = (source, layer, filter, color, weight) => {
    const id = `${source}-waterway`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': 15,
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
        'symbol-placement': 'line',
        'symbol-spacing': 500,
      },
    })
  }

  Water = (source, layer, filter, color, weight) => {
    const id = `${source}-water`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': 15,
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
      },
    })
  }

  Places = (source, layer, filter, color, weight) => {
    const id = `${source}-places`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          property: 'type',
          type: 'categorical',
          stops: [
            [{ zoom: 8, value: 'city' }, 11],
            [{ zoom: 8, value: 'town' }, 8],
            [{ zoom: 8, value: 'suburb' }, 6],
            [{ zoom: 8, value: 'village' }, 6],
            [{ zoom: 8, value: 'hamlet' }, 4],
            [{ zoom: 8, value: 'neighbourhood' }, 4],
            [{ zoom: 8, value: 'residential' }, 4],
            [{ zoom: 8, value: 'island' }, 13],
            [{ zoom: 8, value: 'islet' }, 13],
            [{ zoom: 8, value: 'archipelago' }, 13],
            [{ zoom: 8, value: 'aboriginal_lands' }, 13],
            [{ zoom: 18, value: 'city' }, 31],
            [{ zoom: 18, value: 'town' }, 28],
            [{ zoom: 18, value: 'suburb' }, 26],
            [{ zoom: 18, value: 'village' }, 21],
            [{ zoom: 18, value: 'hamlet' }, 19],
            [{ zoom: 18, value: 'neighbourhood' }, 19],
            [{ zoom: 18, value: 'residential' }, 19],
            [{ zoom: 18, value: 'island' }, 13],
            [{ zoom: 18, value: 'islet' }, 13],
            [{ zoom: 18, value: 'archipelago' }, 33],
            [{ zoom: 18, value: 'aboriginal_lands' }, 13],
          ],
        },
        'text-padding': 15,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
      },
    })
  }

  Seas = (source, layer, filter, color, weight) => {
    const id = `seas${source}`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      'symbol-placement': 'point',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          property: 'labelrank',
          type: 'exponential',
          stops: [
            [{ zoom: 1, value: 1 }, 13],
            [{ zoom: 1, value: 2 }, 10],
            [{ zoom: 1, value: 4 }, 7],
            [{ zoom: 1, value: 6 }, 5],
            [{ zoom: 21, value: 1 }, 63],
            [{ zoom: 21, value: 2 }, 60],
            [{ zoom: 21, value: 4 }, 57],
            [{ zoom: 21, value: 6 }, 54],
          ],
        },
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
        'symbol-spacing': 500,
      },
    })
  }

  CurvedSeas = (source, layer, filter, color, weight) => {
    const id = `${source}-curved-seas`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          stops: [[1, 15], [21, 40]],
        },
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
        'symbol-placement': 'line',
        'symbol-spacing': 1000,
      },
    })
  }

  Cities = (source, layer, filter, color, weight) => {
    const id = `${source}-cities`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          property: 'scalerank',
          type: 'exponential',
          stops: [
            [{ zoom: 1, value: 2 }, 5],
            [{ zoom: 1, value: 4 }, 3],
            [{ zoom: 1, value: 6 }, 1],
            [{ zoom: 1, value: 8 }, 0],
            [{ zoom: 1, value: 10 }, 0],
            [{ zoom: 21, value: 2 }, 45],
            [{ zoom: 21, value: 4 }, 43],
            [{ zoom: 21, value: 6 }, 41],
            [{ zoom: 21, value: 8 }, 39],
            [{ zoom: 21, value: 10 }, 37],
          ],
        },
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
      },
    })
  }

  States = (source, layer, filter, color, weight) => {
    const id = `${source}-states`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          stops: [[1, 8], [21, 48]],
        },
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
      },
    })
  }

  Metropoles = (source, layer, filter, color, weight) => {
    const id = `${source}-metropoles`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          property: 'scalerank',
          type: 'exponential',
          stops: [[{ zoom: 1, value: 0 }, 7], [{ zoom: 1, value: 1 }, 5], [{ zoom: 21, value: 0 }, 47], [{ zoom: 21, value: 1 }, 45]],
        },
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
      },
    })
  }

  Countries = (source, layer, filter, color, weight) => {
    const id = `${source}-countries`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id: `${source}-countries`,
      source,
      'source-layer': layer,
      filter,
      type: 'symbol',
      paint: {
        'text-color': color,
        'text-halo-width': 3,
        'text-halo-color': '#fff',
      },
      layout: {
        'text-size': {
          property: 'scalerank',
          type: 'exponential',
          stops: [
            [{ zoom: 1, value: 1 }, 14],
            [{ zoom: 1, value: 2 }, 11],
            [{ zoom: 1, value: 3 }, 8],
            [{ zoom: 1, value: 4 }, 7],
            [{ zoom: 1, value: 5 }, 5],
            [{ zoom: 1, value: 6 }, 0],
            [{ zoom: 21, value: 1 }, 54],
            [{ zoom: 21, value: 2 }, 51],
            [{ zoom: 21, value: 3 }, 48],
            [{ zoom: 21, value: 4 }, 47],
            [{ zoom: 21, value: 5 }, 45],
            [{ zoom: 21, value: 6 }, 40],
          ],
        },
        'text-padding': 10,
        'text-field': `{name${this.lang}}`,
        'text-font': [`Open Sans ${weight}`],
        'text-transform': 'uppercase',
      },
    })
  }

  Star = e => {
    const id = `star-${e}`
    if (this.map.getLayer(id)) return

    this.map.addLayer({
      id: `star-${e}`,
      source: 'points',
      filter: ['==', 'e', e],
      type: 'symbol',
      layout: {
        'text-size': 13,
        'text-field': '{name}',
        'text-font': ['Open Sans Regular'],
        'text-transform': 'uppercase',
        'text-anchor': 'top',
        'icon-image': 'star',
        'icon-anchor': 'bottom',
      },
      paint: {
        'text-color': '#444',
        'text-halo-color': 'rgba(255, 255, 255, 1)',
        'text-halo-width': 3,
      },
    })

    this.map.on('mouseenter', id, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', id, () => {
      this.map.getCanvas().style.cursor = ''
    })

    this.map.on('click', id, data => {
      const link = data.features[0].properties.link
      this.handlePlaceClick(link)
    })
  }

  Pointer = name => {
    const id = `links-${name}`
    this.map.on('mouseenter', id, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })
    this.map.on('mouseleave', id, () => {
      this.map.getCanvas().style.cursor = ''
    })

    if (name === 'metropoles') {
      this.map.on('click', id, data => {
        const link = data.features[0].properties.link
        this.handlePlaceClick(link)
      })
    }
  }

  Shape = ({ e, index }) => {
    const id = `shape-fill-${e}`
    this.map.addLayer({
      id,
      type: 'fill',
      source: 'shapes',
      layout: {},
      paint: { 'fill-color': COLORS[index], 'fill-opacity': 0 },
      filter: ['==', 'e', e],
    })

    this.map.addLayer({
      id: `shape-border-offset-${e}`,
      type: 'line',
      source: 'shapes',
      layout: {},
      paint: {
        'line-color': COLORS[index],
        'line-width': 2.5,
        'line-opacity': 0.15,
        'line-offset': 1.5,
      },
      filter: ['==', 'e', e],
    })

    this.map.addLayer({
      id: `shape-border-${e}`,
      type: 'line',
      source: 'shapes',
      layout: {},
      paint: { 'line-color': COLORS[index], 'line-width': 0.5 },
      filter: ['==', 'e', e],
    })

    const shapeFill = `shape-fill-${e}`

    this.map.on('mousemove', shapeFill, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })

    this.map.on('mouseleave', shapeFill, () => {
      this.map.getCanvas().style.cursor = ''
    })

    this.map.on('click', shapeFill, data => {
      const link = data.features[0].properties.link
      this.handlePlaceClick(link)
    })
  }

  Caption = ({ e, icon, index }) => {
    const id = `shape-caption-${e}`
    this.map.addLayer({
      id,
      type: 'symbol',
      source: 'points',
      layout: Object.assign(
        {},
        {
          'text-size': 13,
          'text-field': '{name}',
          'text-font': ['Open Sans Bold'],
          'text-transform': 'uppercase',
        },
        icon && {
          'text-offset': [0, -1.1],
          'text-anchor': 'bottom',
          'icon-image': `${index + 1}-${icon}`,
          'icon-anchor': 'top',
          'icon-offset': [0, -15],
          'icon-size': 1,
        }
      ),
      paint: {
        'text-color': COLORS[index],
        'text-halo-width': 2,
        'text-halo-color': '#fff',
      },
      filter: ['==', 'e', e],
    })

    const shapeCaption = `shape-caption-${e}`

    this.map.on('mousemove', shapeCaption, () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })

    this.map.on('mouseleave', shapeCaption, () => {
      this.map.getCanvas().style.cursor = ''
    })

    this.map.on('click', shapeCaption, data => {
      const link = data.features[0].properties.link
      this.handlePlaceClick(link)
    })
  }

  clearMap = recommendations => {
    recommendations.map(entry => {
      if (this.map.getLayer(`shape-border-offset-${entry.e}`)) this.map.removeLayer(`shape-border-offset-${entry.e}`)
      if (this.map.getLayer(`shape-border-${entry.e}`)) this.map.removeLayer(`shape-border-${entry.e}`)
      if (this.map.getLayer(`shape-fill-${entry.e}`)) this.map.removeLayer(`shape-fill-${entry.e}`)
      if (this.map.getLayer(`shape-caption-${entry.e}`)) this.map.removeLayer(`shape-caption-${entry.e}`)
    })
  }

  handleLoad = () => {
    if (!this.map.getSource('mapbox')) {
      this.map.addSource('mapbox', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v7',
      })
    }

    if (!this.map.getSource('shapes')) {
      this.map.addSource('shapes', {
        type: 'geojson',
        data: `${S3_DATA_URL}/new_shapes.geojson`,
      })
      this.setState({ shapeLoaded: true })
    }

    if (!this.map.getSource('points')) {
      this.map.addSource('points', {
        type: 'geojson',
        data: `${S3_DATA_URL}/new_points.geojson`,
      })
      this.setState({ pointLoaded: true })
    }

    if (!this.map.getSource('links')) {
      this.map.addSource('links', {
        type: 'vector',
        url: 'mapbox://cartaguide.80tjqhr1',
      })
    }

    this.map.on('mousemove', 'links', () => {
      this.map.getCanvas().style.cursor = 'pointer'
    })

    this.lang = '_en'
    this.everything = ['!=', 'name', '']

    this.Icons({
      id: 'poi',
      source: 'mapbox',
      layer: 'poi_label',
      filter: this.everything,
      color: '#888',
      opacity: 0.3,
      weight: 'Light',
    })

    this.Roads('mapbox', 'road_label', this.everything, '#888', 'Light')
    this.Waterways('mapbox', 'waterway_label', this.everything, '#ccc', 'Light')
    this.Water('mapbox', 'water_label', this.everything, '#ccc', 'Light')
    this.Places('mapbox', 'place_label', this.everything, { stops: [[7, '#aaa'], [8, '#888']] }, 'Light')

    this.Icons({
      id: 'railstations',
      source: 'mapbox',
      layer: 'rail_station_label',
      filter: this.everything,
      color: '#888',
      opacity: 0.3,
      weight: 'Light',
    })

    this.Icons({
      id: 'peaks',
      source: 'mapbox',
      layer: 'mountain_peak_label',
      filter: this.everything,
      color: '#888',
      textfield: `{name${this.lang}} \n ({elevation_m}m)`,
      opacity: 0.3,
      weight: 'Light',
    })

    this.Icons({
      id: 'airports',
      source: 'mapbox',
      layer: 'airport_label',
      filter: this.everything,
      color: '#888',
      textsize: { stops: [[10, 10], [20, 30]] },
      opacity: 0.3,
      weight: 'Light',
    })

    this.Seas('mapbox', 'marine_label', ['==', 'placement', 'point'], '#ddd', 'Light')
    this.CurvedSeas('mapbox', 'marine_label', ['==', 'placement', 'line'], '#ddd', 'Light')
    this.Cities('mapbox', 'place_label', ['all', ['==', 'type', 'city'], ['>=', 'scalerank', 2]], { stops: [[7, '#aaa'], [8, '#888']] }, 'Light')
    this.Cities('links', 'place_link-abgtyj', this.everything, '#666', 'Regular')
    this.States('mapbox', 'state_label', this.everything, { stops: [[7, '#ccc'], [8, '#aaa']] }, 'Light')
    this.Metropoles('mapbox', 'place_label', ['all', ['==', 'type', 'city'], ['<=', 'scalerank', 1]], { stops: [[7, '#aaa'], [8, '#888']] }, 'Light')
    this.Metropoles('links', 'place_link-abgtyj', this.everything, '#666', 'Regular')
    this.Countries('mapbox', 'country_label', this.everything, { stops: [[7, '#aaa'], [8, '#888']] }, 'Light')

    this.Pointer('cities')
    this.Pointer('metropoles')

    this.addRecommendation(this.props)
  }

  handleMapChange = evt => {
    if (evt.type === 'zoomend' && evt.originalEvent && evt.originalEvent.type !== 'wheel') return

    const { params } = this.props
    const zoom = this.map.getZoom()
    const { lng, lat } = this.map.getCenter()

    const url = urlComposer({
      params: JSON.parse(JSON.stringify(params)),
      change: 'viewport',
      value: `${parseFloat(lng.toFixed(6))},${parseFloat(lat.toFixed(6))},${parseFloat(zoom.toFixed(2))}`,
    })
    browserHistory.push(url)
  }

  handlePlaceClick = place => {
    browserHistory.push(`/in/${place}`)
  }

  handleResize = () => {
    if (this.map) {
      this.map.resize()
    }
  }

  render() {
    const { onClick } = this.props

    return (
      <div id="map" className="map" onClick={onClick}>
        <ReactResizeDetector handleWidth handleHeight onResize={this.handleResize} />
      </div>
    )
  }
}

export default withRouter(Map)
