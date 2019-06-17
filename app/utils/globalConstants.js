export const API_BASE_URL = process.env.API_BASE_URL

export const MAP_ACCESS_TOKEN = process.env.MAP_ACCESS_TOKEN

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY
export const AWS_REGION = process.env.AWS_REGION

export const S3_BUCKET_URL = process.env.S3_BUCKET_URL
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME
export const S3_USER_PROFILE_IMAGE_URL = 'user'
export const S3_USER_HOLIDAY_IMAGE_URL = 'holiday'
export const S3_HOLIDAY_IMAGE_URL = `${S3_BUCKET_URL}/holiday/random`
export const S3_POST_IMAGE_URL = 'post'
export const S3_COVER_URL = `${S3_BUCKET_URL}/cover`
export const S3_ICON_URL = `${S3_BUCKET_URL}/icon`
export const S3_PROFILE_URL = `${S3_BUCKET_URL}/profile`
export const S3_DATA_URL = `${S3_BUCKET_URL}/data`
export const S3_FIXED_URL = `${S3_BUCKET_URL}/fixed`
export const S3_PLACE_URL = `${S3_BUCKET_URL}/place`
export const S3_MAKI_URL = `${S3_BUCKET_URL}/maki`
export const S3_BROCHURE_IMAGE_URL = `${S3_BUCKET_URL}/brochure`

export const COLORS = ['#dd0008', '#ed7000', '#009985', '#29549a', '#8f1379']
export const RECOMMENDATION_COUNT = 5
export const CENTER_COORDS = { lng: 3, lat: 35 }
export const DEFAULT_ZOOM = 1
export const DEFAULT_LIMIT = 6
export const MIN_ZOOM = 0
export const MAX_ZOOM = 18
export const TILE_SIZE = 128

export const INITIAL_PARAM = {}
export const INITIAL_VIEWPORT = `${CENTER_COORDS.lng},${CENTER_COORDS.lat},${DEFAULT_ZOOM}`

export const DESKTOP_WIDTH = 992
export const TABLET_WIDTH = 768
