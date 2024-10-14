import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { blockUser } from "~api"
import { toJson } from "~background/utils"
import { storageKeys } from "~shared"
import { sleep } from "~utils"

export type BlockBotsRequest = { botIds: string[]; timeout?: number }
export type BlockBotsResponse = {
  succeededBlocks: string[]
  failedBlocks: string[]
}

const handler: PlasmoMessaging.MessageHandler<
  BlockBotsRequest,
  BlockBotsResponse
> = async ({ body: { botIds, timeout = 2500 } }, res) => {
  const storage = new Storage({ area: "local" })

  const headers = await storage.get(storageKeys.headers).then(toJson)
  if (!headers) {
    throw new Error("headers not found")
  }

  const succeededBlocks = []
  const failedBlocks = []
  for (const botId of botIds) {
    try {
      const isBlocked = await blockUser(botId, headers)

      if (isBlocked) {
        succeededBlocks.push(botId)
      } else {
        failedBlocks.push(botId)
      }

      await sleep(timeout)
    } catch (error) {
      console.error(`Error blocking bot ${botId}. Error:`, error)
    }
  }

  res.send({ succeededBlocks, failedBlocks })
}

export default handler
