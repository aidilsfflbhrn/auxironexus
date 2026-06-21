export const config = { maxDuration: 10 }

export default async function handler(req) {
  try {
    const urlParams = new URLSearchParams(req.url.split('?')[1] ?? '')
    const session = urlParams.get('session') ?? 'presession'

    const keyMap = {
      monday_week: 'brief:monday_week',
      monday_nyopen: 'brief:monday_nyopen',
      presession: 'brief:presession',
      nyopen: 'brief:nyopen'
    }
    const briefKey = keyMap[session] ?? 'brief:presession'

    const kvUrl = process.env.KV_REST_API_URL
    const kvToken = process.env.KV_REST_API_TOKEN

    if (!kvUrl || !kvToken) {
      return Response.json({
        error: true,
        message: 'Storage not configured'
      }, { status: 500 })
    }

    try {
      const cacheRes = await fetch(`${kvUrl}/get/${briefKey}`, {
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

    const notReadyMessages = {
      monday_week: 'Monday Week Ahead brief generates automatically at 5:00 AM SGT Sunday.',
      monday_nyopen: 'Monday NY Open brief generates automatically at 9:35 PM SGT Monday.',
      presession: 'Pre-Session brief generates automatically at 8:00 PM SGT.',
      nyopen: 'NY Open brief generates at 9:35 PM SGT — 5 minutes after NY open.'
    }

    return Response.json({
      error: false,
      notReady: true,
      session,
      message: notReadyMessages[session] ?? notReadyMessages.presession
    })

  } catch (error) {
    return Response.json({
      error: true,
      message: error.message
    }, { status: 500 })
  }
}
