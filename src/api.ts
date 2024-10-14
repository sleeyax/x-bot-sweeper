import type { Cursor, Followers, Headers, User } from "~shared"

export async function blockUser(userId: string, headers: Headers) {
  const res = await fetch("https://x.com/i/api/1.1/blocks/create.json", {
    method: "POST",
    headers: {
      ...headers,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: `user_id=${userId}`,
    credentials: "include"
  })

  return res.ok
}

export async function getFollowers(
  userId: string,
  headers: Headers,
  cursor?: string
): Promise<Followers> {
  const variables = {
    userId,
    count: 20,
    cursor,
    includePromotedContent: false
  }
  const features = {
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
      true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_enhance_cards_enabled: false
  }
  const url = `https://x.com/i/api/graphql/gwv4MK0diCpAJ79u7op1Lg/Followers?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}`
  const res = await fetch(url, {
    method: "GET",
    headers: {
      ...headers,
      "Cache-Control": "no-cache",
      Priority: "u=1, i"
    }
  })
  if (!res.ok) {
    throw new Error("Failed to fetch followers.")
  }

  const json = await res.json()

  const instruction = json.data.user.result.timeline.timeline.instructions.find(
    (instruction: Record<string, string>) =>
      instruction.type === "TimelineAddEntries"
  )

  const users: User[] = []
  let nextCursor: Cursor = undefined

  for (const entry of instruction.entries) {
    if (entry.content?.itemContent?.itemType === "TimelineUser") {
      const user = entry.content.itemContent.user_results.result

      users.push({
        id: user.rest_id,
        isBlueVerified: user.is_blue_verified || user.legacy.verified,
        isFollowing: user.legacy.following, // whether we follow this user, can be useful for filtering
        createdAt: new Date(user.legacy.created_at),
        name: user.legacy.name,
        username: user.legacy.screen_name,
        bio: user.legacy.description,
        followersCount: user.legacy.followers_count,
        followingCount: user.legacy.friends_count,
        profileImage: user.legacy.profile_image_url_https
      })
    } else if (
      entry.content.entryType === "TimelineTimelineCursor" &&
      entry.content.cursorType.toLowerCase() === "bottom"
    ) {
      nextCursor = entry.content.value
    }
  }

  return { users, cursor: nextCursor }
}
