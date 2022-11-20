import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import errorMiddleware from "./middlewares/error.middleware.js"
import ws from "express-ws"

import userRouter from "./routes/user.routes.js"
import userSocket from "./services/socket.service.js"

dotenv.config()

const PORT = process.env.PORT || 8080
const app = express()
const WSServer = ws(app)
const aWss = WSServer.getWss()
app.ws("/echo", (ws, req) => userSocket(ws, aWss))

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
    // origin: [process.env.CLIENT_URL_PRIMARY, process.env.CLIENT_URL_SECONDARY],
  }),
)
app.use(cookieParser())
app.use(express.json())
app.use("/api", userRouter)
app.use(errorMiddleware)

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server has started on port: ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}
start()
