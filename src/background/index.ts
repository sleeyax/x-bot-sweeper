import { Storage } from "@plasmohq/storage"

import { domains, rootDomain, storageKeys } from "~shared"

import { getCookies } from "./utils"

const storage = new Storage({ area: "local" })

chrome.webRequest.onSendHeaders.addListener(
  async (req) => {
    if (
      req.url.includes("api") &&
      req.url.includes("graphql") &&
      req.url.includes("HomeTimeline")
    ) {
      // Convert request headers to an object with lowercase keys.
      const requestHeaders: Record<string, string> = req.requestHeaders.reduce(
        (prev, acc) => ((prev[acc.name.toLowerCase()] = acc.value), prev),
        {}
      )
      // Add cookies.
      const headers = {
        ...requestHeaders,
        cookie: await getCookies(rootDomain)
      }
      // Store the result in storage for later use.
      await storage.set(storageKeys.headers, JSON.stringify(headers))
    }
  },
  { urls: domains },
  ["requestHeaders"]
)
