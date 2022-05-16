export default function userSocket(ws, aWss) {
  ws.on("message", (msg) => {
    setInterval(() => {
      let serverTime = new Date().toTimeString()
      aWss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            method: "herokuConnection",
            serverTime,
          })
        )
      })
    }, 30000)

    msg = JSON.parse(msg)

    switch (msg.method) {
      case "connection":
        connectionHandler(ws, msg)
        break
      case "chat":
        broadcast(msg)
        break
      case "arenares":
        arenaRes(msg)
        break
      case "playerchoice":
        broadcast(msg)
        break
      case "pointerdown":
        broadcast(msg)
        break
      case "pointermove":
        broadcast(msg)
        break
      case "pointerup":
        broadcast(msg)
        break
      case "pointerout":
        broadcast(msg)
        break
      case "whoisaudio":
        whoisaudio(msg)
        break
      case "offer":
        onewaysend(msg)
        break
      case "candidate":
        onewaysend(msg)
        break
      case "answer":
        onewaysend(msg)
        break
      case "audioclientleave":
        ws.audio = false
        onewaysend(msg)
        break
      case "lastaudioleave":
        ws.audio = false
        broadcast(msg)
        break
      case "close":
        broadcast(msg)
      default:
        console.log("Socket has been closed by ", msg.nickname)
        break
    }
  })
  const connectionHandler = (ws, msg) => {
    let sameuser = false

    if (aWss.clients.size > 0) {
      aWss.clients.forEach((client) => {
        if (client.nickname === msg.nickname) {
          sameuser = true
        }
      })
    }
    if (sameuser) {
      ws.send(
        JSON.stringify({
          method: "reject",
          message: "Such nickname already exists",
        })
      )
    } else {
      ws.session = msg.session
      ws.nickname = msg.nickname
      ws.audio = false
      let inaudio = false
      aWss.clients.forEach((client) => {
        if (client.session === msg.session && client.audio) inaudio = true
      })
      ws.send(
        JSON.stringify({
          method: "connected",
          session: msg.session,
          nickname: msg.nickname,
          inaudio,
        })
      )
      broadcast({
        method: "newclient",
        session: msg.session,
        nickname: msg.nickname,
        number: aWss.clients.size,
        message: "just connected",
        msgId: Date.now(),
      })
      arenaReq(msg)
    }
  }
  const arenaReq = (msg) => {
    if (aWss.clients.size > 0) {
      const iterator1 = aWss.clients.values()
      let clientWithState = iterator1.next().value
      while (clientWithState.session !== msg.session) {
        clientWithState = iterator1.next().value
      }
      aWss.clients.forEach((client) => {
        if (
          client.nickname === clientWithState.nickname &&
          client.session === msg.session
        ) {
          client.send(
            JSON.stringify({
              method: "arenareq",
              session: msg.session,
              nickname: msg.nickname,
            })
          )
        }
      })
    }
  }
  const arenaRes = (msg) => {
    aWss.clients.forEach((client) => {
      if (client.nickname === msg.toUser && client.session === msg.session) {
        client.send(
          JSON.stringify({
            method: "arenares",
            session: msg.session,
            arenaOrientation: msg.arenaOrientation,
            playersState: msg.playersState,
          })
        )
      }
    })
  }

  const whoisaudio = (msg) => {
    let audioClients = []
    aWss.clients.forEach((client) => {
      if (client.session === msg.session && client.audio) {
        audioClients.push({
          session: client.session,
          nickname: client.nickname,
        })
      }
    })
    ws.audio = true
    ws.send(JSON.stringify({ method: "audioclients", audioClients }))
    aWss.clients.forEach((client) => {
      if (client.session === msg.session && !client.audio) {
        client.send(
          JSON.stringify({
            method: "inaudio",
            client: client.nickname,
          })
        )
      }
    })
  }

  const onewaysend = (msg) => {
    aWss.clients.forEach((client) => {
      if (client.nickname === msg.toClient) {
        client.send(JSON.stringify(msg))
      }
    })
  }

  const broadcast = (msg) => {
    aWss.clients.forEach((client) => {
      if (client.session === msg.session) {
        client.send(JSON.stringify(msg))
      }
    })
  }
}
