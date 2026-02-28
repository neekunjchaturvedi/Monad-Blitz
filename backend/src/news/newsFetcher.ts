/**
 * News Fetcher
 * - Polls CryptoPanic RSS + CoinDesk RSS every 60s
 * - Pushes headlines to feed WebSocket
 * - Calls checkAndLaunch so launcher agents can react
 */

import cron from 'node-cron'
import Parser from 'rss-parser'
import { feed } from '../feed/feedService.js'
import { checkAndLaunch } from '../agents/launcherAgent.js'

const parser = new Parser()

const RSS_FEEDS = [
  { url: 'https://feeds.feedburner.com/CoinDesk', source: 'CoinDesk' },
  { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
  { url: 'https://decrypt.co/feed', source: 'Decrypt' },
]

// CryptoPanic API (optional — better quality, requires key)
async function fetchCryptoPanic(): Promise<{ title: string; source: string }[]> {
  const key = process.env.CRYPTOPANIC_API_KEY
  if (!key) return []

  try {
    const res = await fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${key}&filter=hot&public=true`)
    const json = await res.json() as { results?: { title: string }[] }
    return (json.results ?? []).map(r => ({ title: r.title, source: 'CryptoPanic' }))
  } catch {
    return []
  }
}

async function fetchRSS(feedUrl: string, source: string): Promise<{ title: string; source: string }[]> {
  try {
    const feed = await parser.parseURL(feedUrl)
    return (feed.items ?? []).slice(0, 10).map(item => ({
      title: item.title ?? '',
      source,
    }))
  } catch {
    return []
  }
}

const seenHeadlines = new Set<string>()

async function fetchAndBroadcast() {
  const rssResults = await Promise.all(RSS_FEEDS.map(f => fetchRSS(f.url, f.source)))
  const cpResults = await fetchCryptoPanic()

  const allItems = [...rssResults.flat(), ...cpResults]

  for (const item of allItems) {
    if (!item.title || seenHeadlines.has(item.title)) continue
    seenHeadlines.add(item.title)

    // Keep set from growing unbounded
    if (seenHeadlines.size > 2000) {
      const first = seenHeadlines.values().next().value
      if (first) seenHeadlines.delete(first)
    }

    const newsEvent = { headline: item.title, source: item.source, ts: Date.now() }
    feed.emit('news', newsEvent)

    // Let launcher agents react
    await checkAndLaunch(item.title, item.source).catch(err =>
      console.error('[news] launcher check error:', err)
    )
  }
}

export function startNewsFetcher() {
  console.log('[news] Starting news fetcher (every 60s)')
  fetchAndBroadcast()                           // run immediately on start
  cron.schedule('* * * * *', fetchAndBroadcast) // then every minute
}
