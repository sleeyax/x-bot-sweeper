export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function toFullSizeImage(url: string) {
  return url.replace("_normal", "")
}
