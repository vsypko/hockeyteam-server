import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import pool from '../pool.js'
import tokenService from './token.service.js'
import mailService from './mail.service.js'
import ApiError from '../exceptions/api.error.js'

class UserService {
  //--------------------------------------------REGISTRATION---------------------------------------
  async registration(email, password) {
    const hashPassword = await bcrypt.hash(password, 3)

    const isUser = await pool.query(`SELECT 1 FROM users WHERE user_email=$1`, [email])
    if (isUser.rowCount != 0) {
      throw ApiError.BadRequest(`Entered email: ${email} already exists.`)
    }
    const activationLink = uuidv4()
    const newUser = await pool.query(
      `INSERT INTO users (user_email, user_password, user_activationlink) values ($1, $2, $3) RETURNING *`,
      [email, hashPassword, activationLink]
    )
    const user = newUser.rows[0]

    await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
    const tokens = tokenService.generateTokens({
      userId: user.user_id,
      email,
      role: user.user_role_id,
    })
    await tokenService.saveToken(user.user_id, tokens.refreshToken)
    return { ...tokens, user }
  }
  //--------------------------------------------ACTIVATION---------------------------------------
  async activate(activationLink) {
    const isActivated = await pool.query(`SELECT 1 FROM users WHERE user_activationlink=$1`, [activationLink])
    if (isActivated.rowCount === 0) {
      throw ApiError.BadRequest('Incorrect activation link.')
    }

    const activateUser = await pool.query(
      `UPDATE users SET user_activated = $1 WHERE user_activationlink=$2 RETURNING *`,
      [true, activationLink]
    )
  }
  //--------------------------------------------LOG IN-------------------------------------------
  async login(email, password) {
    const isUser = await pool.query(`SELECT * FROM users WHERE user_email=$1`, [email])
    if (isUser.rowCount === 0) {
      throw ApiError.BadRequest(`User with email: ${email} was not found.`)
    }
    if (!isUser.rows[0].user_password) {
      throw ApiError.BadRequest(`For ${email} login with a google account.`)
    }
    const isPassEquals = await bcrypt.compare(password, isUser.rows[0].user_password)
      if (!isPassEquals) {
        throw ApiError.BadRequest(`Incorrect password.`)
      }
    const tokens = tokenService.generateTokens({
      userId: isUser.rows[0].user_id,
      email,
      role: isUser.rows[0].user_role_id,
    })
    await tokenService.saveToken(isUser.rows[0].user_id, tokens.refreshToken)
    return { ...tokens, user: isUser.rows[0] }
  }
  //--------------------------------------------LOG IN WITH GOOGLE--------------------------------
  async googleauth(email) {
    const candidate = await pool.query(`SELECT * FROM users WHERE user_email=$1`, [email])
    let user={}
    if (candidate.rowCount === 0) {
      const newUser = await pool.query(`INSERT INTO users (user_email, user_activated) values ($1, $2) RETURNING *`,
      [email, true])
      user = newUser.rows[0]
    } else {
      user = candidate.rows[0] 
    }
    
    const tokens = tokenService.generateTokens({
      userId: user.user_id,
      email: user.user_email,
      role: user.user_role_id,
    })
    await tokenService.saveToken(user.user_id, tokens.refreshToken)
    return { ...tokens, user }

  }
  //--------------------------------------------LOG OUT-------------------------------------------
  async logout(refreshToken) {
    const tokenData = tokenService.removeToken(refreshToken)
    return tokenData
  }
  //--------------------------------------------REFRESH-------------------------------------------
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError()
    }
    const userData = tokenService.validationToken(refreshToken, process.env.JWT_REFRESH_SECRET)
    const tokenFromDb = await tokenService.findToken(refreshToken)

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError()
    }
    const user = await pool.query(`SELECT * FROM users WHERE user_id=$1`, [userData.userId])
    const tokens = tokenService.generateTokens({
      userId: user.rows[0].user_id,
      email: user.rows[0].user_email,
      role: user.rows[0].user_role,
    })
    await tokenService.saveToken(user.rows[0].user_id, tokens.refreshToken)
    return { ...tokens, user }
  }
  //--------------------------------------------GET ALL USERS-------------------------------------------
  async getAllUsers() {
    const users = await pool.query(`SELECT * FROM users`)
    return users.rows
  }
  //--------------------------------------------GET ONE USERS-------------------------------------------
  async getOneUser(id) {
    const user = await pool.query(`SELECT * FROM users WHERE user_id=$1`, [id])
    return user.rows
  }
}
export default new UserService()
