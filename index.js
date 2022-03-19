import express from 'express'
import userRouter from './routes/user.routes.js'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorMiddleware from './middlewares/error.middleware.js'
import ws from 'express-ws'

dotenv.config()

const PORT = process.env.PORT || 8000
const app = express()
const WSServer = ws(app)
const aWss = WSServer.getWss()

app.ws('/echo', (ws, req) => {
  ws.on('message', (msg) => {
    msg = JSON.parse(msg)

    switch (msg.method) {
      case 'connection':
        connectionHandler(ws, msg)
        break
        case 'chat':
        broadcast(msg)
        break
      case 'arenares':
        arenaRes(msg)
        break
      case 'playerchoice':
        broadcast(msg)
        break
      case 'pointerdown':
        broadcast(msg)
        break
      case 'pointermove':
        broadcast(msg)
        break
      case 'pointerup':
        broadcast(msg)
        break
      case 'pointerout':
        broadcast(msg)
        break
      default:
        console.log('disconnected')
        break
    }
  })
})

const connectionHandler = (ws, msg) => {
  ws.id = msg.id
  ws.nickname = msg.nickname
  broadcast(msg)
  arenaReq(msg)
}
const arenaReq = (msg) => {
  if (aWss.clients.size > 0) {
    const iterator1 = aWss.clients.values()
    let clientWithState = iterator1.next().value
    while (clientWithState.id !== msg.id) {
      clientWithState = iterator1.next().value
    }
    aWss.clients.forEach((client) => {
      if (client.nickname === clientWithState.nickname && client.id === msg.id) {
        client.send(
          JSON.stringify({
            method: 'arenareq',
            id: msg.id,
            nickname: msg.nickname,
          })
        )
      }
    })
  }
}
const arenaRes = (msg) => {
  aWss.clients.forEach((client) => {
    if (client.nickname === msg.toUser && client.id === msg.id) {
      client.send(
        JSON.stringify({
          method: 'arenares',
          id: msg.id,
          arenaOrientation: msg.arenaOrientation,
          playersState: msg.playersState,
        })
      )
    }
  })
}

const broadcast = (msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      client.send(JSON.stringify(msg))
    }
  })
}

app.use(cookieParser())
app.use(express.json())

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
)
app.use('/api', userRouter)
app.use(errorMiddleware)

const start = async () => {
  try {
    app.listen(PORT, () => console.log(`Server started on port: ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}
start()
