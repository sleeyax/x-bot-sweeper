import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { blockUser } from "~api"
import { storageKeys, type MessageRequest, type MessageResponse } from "~shared"
import { sleep, toJson } from "~utils"

export type BlockBotsRequest = MessageRequest<{
  botIds: string[]
  timeout?: number
}>
export type BlockBotsResponse = MessageResponse<{
  succeededBlocks: string[]
  failedBlocks: string[]
}>

const handler: PlasmoMessaging.MessageHandler<
  BlockBotsRequest,
  BlockBotsResponse
> = async ({ body: { botIds, timeout = 2500 } }, res) => {
  try {
    const storage = new Storage({ area: "local" })

    const headers = await storage.get(storageKeys.headers).then(toJson)
    if (!headers) {
      throw new Error(
        "Missing headers. Please visit 'x.com/home' to fix this issue."
      )
    }

    const succeededBlocks = []
    const failedBlocks = []
    for (const botId of botIds) {
      const isBlocked = await blockUser(botId, headers)

      if (isBlocked) {
        succeededBlocks.push(botId)
      } else {
        failedBlocks.push(botId)
      }

      await sleep(timeout)
    }

    res.send({ succeededBlocks, failedBlocks, isError: false })
  } catch (error) {
    console.error(error)
    res.send({
      failedBlocks: [],
      succeededBlocks: [],
      isError: true,
      error: error.message
    })
  }
}

export default handler
