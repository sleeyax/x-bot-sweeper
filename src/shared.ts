export const domains = ["https://x.com/*"]

export const rootDomain = "x.com"

export const storageKeys = {
  headers: "headers",
  settings: "settings",
  bots: "bots",
  checkedBotIds: "checkedBotIds"
}

export const defaultSettings: Settings = {
  rules: {
    followingToFollowersRatio: 100,
    bannedKeywords: []
  },
  timeouts: {
    blockTimeout: 2500,
    myFollowersListTimeout: 1000
  }
}

export type Rules = {
  /**
   * The ratio is calculated as followingCount / followersCount.
   * Example: a value of 2 means that a user matches this rule when they have are following at least twice as many as they have followers (200 following, 100 followers).
   * Recommended value is 20 (20 times more following than followers).
   */
  followingToFollowersRatio: number

  /**
   * A list of suspicious keywords to look for in the user's bio.
   */
  bannedKeywords: string[]
}

export type MatchedRule = keyof Rules

export type Settings = {
  /**
   * The rules to apply when checking for bots.
   */
  rules: Rules

  /**
   * The timeouts to apply when fetching data.
   */
  timeouts: {
    /**
     * The time in milliseconds to wait between each block request.
     */
    blockTimeout: number

    /**
     * The time in milliseconds to wait between each request in order to fetch the whole user followers list.
     */
    myFollowersListTimeout: number
  }
}

export type Headers = Record<string, string>

export type User = {
  id: string
  isBlueVerified: boolean
  isFollowing: boolean
  createdAt: Date
  name: string
  username: string
  bio: string
  followersCount: number
  followingCount: number
  profileImage: string
}

export type Bot = User & {
  matchedRule: MatchedRule
  ratio: number
}

export type Followers = {
  users: User[]
  cursor?: string
}

export type FollowersFilter = "all" | "recent"

export type MessageRequest<T> = T
export type MessageResponse<T> = T & { error?: string; isError: boolean }
