export async function getCookies(domain: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!chrome?.cookies?.getAll) {
      reject("chrome.cookies.getAll is not available")
    }

    chrome.cookies.getAll({ domain }, (cookies) => {
      const value = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ")

      resolve(value)
    })
  })
}

export async function getCookie(domain: string, name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!chrome?.cookies?.get) {
      reject("chrome.cookies.get is not available")
    }

    chrome.cookies.get({ url: domain, name }, (cookie) => {
      resolve(cookie?.value ?? "")
    })
  })
}
