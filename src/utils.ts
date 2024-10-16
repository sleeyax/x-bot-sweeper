export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function toFullSizeImage(url: string) {
  return url.replace("_normal", "")
}

export const toJson = (data: string) =>
  (data ?? "").trim() !== "" ? JSON.parse(data) : null
