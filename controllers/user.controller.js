import userService from '../services/user.service.js'
import { validationResult } from 'express-validator'
import ApiError from '../exceptions/api.error.js'
import { OAuth2Client } from 'google-auth-library'

class UserController {
  //---------------------------------REGISTRATION----------------------------------------
  async registration(req, res, next) {
    const { email, password } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(ApiError.BadRequest('Validation error. Entered incorrect data.', errors.array()))
    }
    try {
      const userData = await userService.registration(email, password)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
  //---------------------------------LOG IN----------------------------------------
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const userData = await userService.login(email, password)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
  //-----------------------------GOOGLE AUTH ----------------------------------------
  async googleauth(req,res,next) {
    try {
      const {tokenId} = req.body
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
      const ticket = await client.verifyIdToken({idToken:tokenId, audience: process.env.GOOGLE_CLIENT_ID})
      const payload = ticket.getPayload()
      const userData = await userService.googleauth(payload.email)

      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      return res.json(userData)
    } catch (e) {
      next(e)
    }
  }
  //---------------------------------LOG OUT----------------------------------------
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const token = await userService.logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.status(200).json(`You have been logged out and ${token} token was deleted.`)
    } catch (e) {
      next(e)
    }
  }
  //---------------------------------ACTIVATION----------------------------------------
  async activate(req, res, next) {
    try {
      const activationLink = req.params.link
      await userService.activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    } catch (e) {
      next(e)
    }
  }
  //---------------------------------TOKEN REFRESHING----------------------------------------
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies
      const data = await userService.refresh(refreshToken)

      res.cookie('refreshToken', data.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      return res.status(200).json({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user.rows[0],
      })
    } catch (e) {
      next(e)
    }
  }
  //---------------------------------GET ALL USERS----------------------------------------
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers()
      return res.json(users)
    } catch (e) {
      next(e)
    }
  }
  //---------------------------------GET ONE USER----------------------------------------
  async getUser(req, res, next) {
    let { user_id } = req.body
    if (!user_id) {
      user_id = req.user.userId
    }
    if (user_id != req.user.userId && req.user.role > 2) {
      return next(ApiError.UnauthorizedError())
    }
    try {
      const user = await userService.getOneUser(user_id)
      return res.json(user)
    } catch (e) {
      next(e)
    }
  }
}

export default new UserController()
