export const config = { maxDuration: 10 }

export default async function handler(req) {
  try {
    const urlParams = new URLSearchParams(req.url.split('?')[1] ?? '')
    const session = urlParams.get('session') ?? 'daily'

    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (!kvUrl || !kvToken) {
      return Response.json({
        error: true,
        message: 'Storage not configured'
      }, { status: 500 })
    }

    // Read from Redis only — no generation here
    const cacheRes = await fetch(`${kvUrl}/get/brief:${session}`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    })

    if (cacheRes.ok) {
      const cacheData = await cacheRes.json()
      if (cacheData?.result) {
        const parsed = JSON.parse(cacheData.result)
        return Response.json({ ...parsed, cached: true })
      }
    }

    // No cached brief found
    return Response.json({
      error: false,
      notReady: true,
      message: session === 'monday'
        ? 'Monday brief generates automatically at 5:00 AM SGT. Check back then.'
        : 'Brief generates automatically at 8:00 PM SGT before NY session. Check back then.',
      session
    })

  } catch (error) {
    return Response.json({
      error: true,
      message: error.message
    }, { status: 500 })
  }
}
