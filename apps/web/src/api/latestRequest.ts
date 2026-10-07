export function createLatestRequest() {
  let current: { controller: AbortController; key: string } | null = null

  function cancel() {
    current?.controller.abort()
    current = null
  }

  return {
    cancel,
    isPending(key: string) { return current?.key === key },
    begin(key: string) {
      cancel()
      const request = { controller: new AbortController(), key }
      current = request
      return {
        signal: request.controller.signal,
        isCurrent: () => current === request,
        finish() { if (current === request) current = null },
      }
    },
  }
}
