import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { getFollowers } from "~api"
import { getCookie, toJson } from "~background/utils"
import { rootDomain, type Bot, type Rules, type StorageKey } from "~shared"

const handler: PlasmoMessaging.MessageHandler<Rules> = async (req, res) => {
  const rules = req.body
  const storage = new Storage({ area: "local" })
  const headers = await storage.get("headers" as StorageKey).then(toJson)
  const userId = await getUserId()

  // TODO: implement pagination
  const { cursor, users } = await getFollowers(userId, headers)

  const bots: Bot[] = []
  for (const user of users) {
    // check follower to follow ratio
    const followingToFollowersRatio = user.followingCount / user.followersCount
    if (followingToFollowersRatio >= rules.followingToFollowersRatio) {
      bots.push({ ...user, matchedRule: "followingToFollowersRatio" })
      continue
    }

    // check bio for banned keywords
    if (rules.bannedKeywords.some((keyword) => user.bio.includes(keyword))) {
      bots.push({ ...user, matchedRule: "bannedKeywords" })
      continue
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
