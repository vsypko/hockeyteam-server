import pg from "pg"

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } })

// const pool = new pg.Pool({
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   database: process.env.DB_NAME,
// })

export default pool
