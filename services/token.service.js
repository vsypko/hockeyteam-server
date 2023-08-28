import jwt from "jsonwebtoken"
import pool from "../pool.js"

class TokenService {
  //-------------------------------GENERATE TOKENS------------------------------------
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30s",
    })
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    })
    return {
      accessToken,
      refreshToken,
    }
  }
  //-------------------------------SAVE TOKENS------------------------------------
  async saveToken(userId, refreshToken) {
    const isToken = await pool.query(`SELECT token_id FROM tokens WHERE token_user=$1`, [userId])
    if (isToken.rowCount != 0) {
      const refToken = await pool.query(`UPDATE tokens SET token_refresh = $1 WHERE token_user=$2 RETURNING *`, [
        refreshToken,
        userId,
      ])
      return refToken
    }
    const newToken = await pool.query(`INSERT INTO tokens (token_refresh, token_user) values ($1, $2) RETURNING *`, [
      refreshToken,
      userId,
    ])
    return newToken
  }
  //-------------------------------REMOVE TOKENS------------------------------------
  async removeToken(refreshToken) {
    const deletedToken = await pool.query(`DELETE FROM tokens WHERE token_refresh = $1 RETURNING *`, [refreshToken])
    return deletedToken.rowCount
  }
  //-------------------------------VALIDATE TOKENS------------------------------------
  validationToken(token, secret) {
    try {
      const userData = jwt.verify(token, secret)
      return userData
    } catch (e) {
      return null
    }
  }
  //-------------------------------FIND TOKEN----------------------------------------
  async findToken(token) {
    const tokenData = await pool.query(`SELECT * FROM tokens WHERE token_refresh=$1`, [token])
    return tokenData
  }
}

export default new TokenService()
