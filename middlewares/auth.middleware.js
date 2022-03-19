import ApiError from '../exceptions/api.error.js'
import tokenService from '../services/token.service.js'

export default (role) => {
  return (req, res, next) => {
    if (req.method === 'OPTIONS') {
      next(ApiError.BadRequest())
    }
    try {
      const authorizationHeader = req.headers.authorization
      if (!authorizationHeader) {
        return next(ApiError.UnauthorizedError())
      }
      const accessToken = authorizationHeader.split(' ')[1]
      if (!accessToken) {
        return next(ApiError.UnauthorizedError())
      }
      const userData = tokenService.validationToken(
        accessToken,
        process.env.JWT_ACCESS_SECRET
      )
      if (!userData) {
        return next(ApiError.UnauthorizedError())
      }
      if (userData.role > role) {
        return next(ApiError.UnauthorizedError())
      }
      req.user = userData
      next()
    } catch (e) {
      return next(ApiError.UnauthorizedError())
    }
  }
}
