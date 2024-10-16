import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { getFollowers } from "~api"
import { getCookie, toJson } from "~background/utils"
import {
  rootDomain,
  storageKeys,
  type Bot,
  type FollowersFilter,
  type Rules
} from "~shared"
import { sleep } from "~utils"

export type FindBotsRequest = { rules: Rules; filter: FollowersFilter }
export type FindBotsResponse = { bots: Bot[] }

const handler: PlasmoMessaging.MessageHandler<
  FindBotsRequest,
  FindBotsResponse
> = async ({ body: { filter, rules } }, res) => {
  const storage = new Storage({ area: "local" })
  const headers = await storage.get(storageKeys.headers).then(toJson)
  const userId = await getUserId()

  let cursor: string | undefined
  const bots: Bot[] = []

  while (true) {
    const res = await getFollowers(userId, headers, cursor)

    for (const user of res.users) {
      // check follower to follow ratio
      const followingToFollowersRatio =
        user.followingCount / user.followersCount
      if (followingToFollowersRatio >= rules.followingToFollowersRatio) {
        bots.push({
          ...user,
          matchedRule: "followingToFollowersRatio",
          ratio: followingToFollowersRatio
        })
        continue
      }

      // check bio for banned keywords
      if (rules.bannedKeywords.some((keyword) => user.bio.includes(keyword))) {
        bots.push({
          ...user,
          matchedRule: "bannedKeywords",
          ratio: followingToFollowersRatio
        })
        continue
      }
    }

    cursor = res.cursor

    if (filter === "all" && cursor != null) {
      await sleep(1000)
    } else {
      break
    }
  }

  res.send({ bots })
}

async function getUserId() {
  const cookie = await getCookie(`https://${rootDomain}`, "twid")
  const decoded = decodeURIComponent(cookie)
  return decoded.replace("u=", "")
}

export default handler
