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

    try {
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
    } catch (redisError) {
      console.log('Redis read failed:', redisError.message)
    }

    return Response.json({
      error: false,
      notReady: true,
      session,
      message: session === 'monday'
        ? 'Monday brief auto-generates at 5:00 AM SGT. Check back then.'
        : 'Brief auto-generates at 8:00 PM SGT before NY session. Check back then.',
      nextGeneration: session === 'monday'
        ? 'Sunday 5:00 AM SGT'
        : 'Weekdays 8:00 PM SGT'
    })

  } catch (error) {
    return Response.json({
      error: true,
      message: error.message
    }, { status: 500 })
  }
}
