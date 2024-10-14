import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { rootDomain, type Bot, type Rules } from "~shared"

import "~styles/reset.css"
import "~styles/global.css"

import type {
  BlockBotsRequest,
  BlockBotsResponse
} from "~background/messages/block-bots"

function IndexPopup() {
  const [bots, setBots] = useStorage<Bot[]>(
    {
      key: "bots",
      instance: new Storage({
        area: "local"
      })
    },
    []
  )
  const [checkedBotIds, setCheckedBotIds] = useStorage<string[]>(
    "checkedBotIds",
    []
  )

  const findRecentBots = async () => {
    const res = await sendToBackground<Rules>({
      name: "find-bots",
      body: { bannedKeywords: [], followingToFollowersRatio: 100 }
    })
    setBots(res.bots)
  }

  const blockBots = async () => {
    const { failedBlocks, succeededBlocks } = await sendToBackground<
      BlockBotsRequest,
      BlockBotsResponse
    >({
      name: "block-bots",
      body: { botIds: checkedBotIds, timeout: 2500 }
    })
    console.log("failedBlocks", failedBlocks)
    console.log("succeededBlocks", succeededBlocks)
    setBots((state) => state.filter((bot) => !succeededBlocks.includes(bot.id)))
    setCheckedBotIds((state) =>
      state.filter((botId) => !succeededBlocks.includes(botId))
    )
  }

  return (
    <div
      style={{
        width: 500,
        padding: 16
      }}>
      <h2>X Bot Sweeper</h2>
      <button onClick={findRecentBots}>Scan recent followers</button>
      <button onClick={findRecentBots}>Scan all followers</button>
      <button onClick={() => setCheckedBotIds([])}>breh</button>
      {checkedBotIds.length > 0 && (
        <button onClick={blockBots} style={{ float: "right" }}>
          Block {checkedBotIds.length} bot(s)
        </button>
      )}
      {bots.length > 0 && (
        <table>
          <thead>
            <tr>
              <th colSpan={2}>User</th>
              <th>Matched rule</th>
              <th>Following</th>
              <th>Followers</th>
              <th>Ratio</th>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setCheckedBotIds(
                      e.target.checked ? bots.map((bot) => bot.id) : []
                    )
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.id}>
                <td
                  style={{
                    width: 40,
                    borderRight: 0
                  }}>
                  <a
                    href={`https://${rootDomain}/${bot.username}`}
                    target="_blank"
                    rel="noopener noreferrer">
                    <img
                      style={{
                        borderRadius: "50%"
                      }}
                      src={bot.profileImage}
                      alt={bot.username}
                    />
                  </a>
                </td>
                <td>
                  <strong>{bot.name}</strong>
                  <p>@{bot.username}</p>
                </td>
                <td>
                  {bot.matchedRule === "followingToFollowersRatio" &&
                    "Suspicious following to followers ratio"}
                  {bot.matchedRule === "bannedKeywords" &&
                    "Found banned keywords in bio"}
                </td>
                <td>{bot.followingCount}</td>
                <td>{bot.followersCount}</td>
                <td>{(bot.followingCount / bot.followersCount).toFixed(2)}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={checkedBotIds.includes(bot.id)}
                    onChange={(e) =>
                      e.target.checked
                        ? setCheckedBotIds((state) => [...state, bot.id])
                        : setCheckedBotIds((state) =>
                            state.filter((v) => v !== bot.id)
                          )
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default IndexPopup
