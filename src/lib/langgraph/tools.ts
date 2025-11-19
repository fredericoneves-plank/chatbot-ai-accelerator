import { tool } from '@langchain/core/tools'
import * as z from 'zod'

export const weatherTool = tool(
  async ({ location }) => {
    try {
      const apiKey = process.env.WEATHER_API_KEY
      if (!apiKey) {
        return 'Weather API key not configured'
      }

      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(location)}`
      )

      if (!response.ok) {
        return `Weather API error: ${response.statusText}`
      }

      const data = await response.json()
      return `Weather in ${data.location.name}, ${data.location.country}:
- Temperature: ${data.current.temp_c}°C (${data.current.temp_f}°F)
- Condition: ${data.current.condition.text}
- Humidity: ${data.current.humidity}%
- Wind: ${data.current.wind_kph} km/h (${data.current.wind_mph} mph)
- Feels like: ${data.current.feelslike_c}°C`
    } catch (error) {
      return `Error fetching weather: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: 'get_weather',
    description: 'Get current weather information for a location',
    schema: z.object({
      location: z
        .string()
        .describe('City name or location (e.g., "New York", "London")'),
    }),
  }
)

export const newsTool = tool(
  async ({ query, limit = 5 }) => {
    try {
      const apiKey = process.env.NEWS_API_KEY
      if (!apiKey) {
        return 'News API key not configured'
      }

      const maxLimit = Math.min(limit, 10)
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}&pageSize=${maxLimit}&sortBy=publishedAt`
      )

      if (!response.ok) {
        return `News API error: ${response.statusText}`
      }

      const data = await response.json()

      if (!data.articles || data.articles.length === 0) {
        return `No news articles found for "${query}"`
      }

      const articles = data.articles
        .slice(0, maxLimit)
        .map((article: any, index: number) => {
          return `${index + 1}. ${article.title}
   Source: ${article.source.name}
   Published: ${new Date(article.publishedAt).toLocaleDateString()}
   ${article.url}`
        })

      return `Latest news about "${query}":\n\n${articles.join('\n\n')}`
    } catch (error) {
      return `Error fetching news: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  },
  {
    name: 'get_news',
    description: 'Get latest news articles for a topic, keyword, or location',
    schema: z.object({
      query: z.string().describe('News topic, keyword, or search term'),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe('Number of articles to return (max 10)'),
    }),
  }
)

export const toolsByName = {
  [weatherTool.name]: weatherTool,
  [newsTool.name]: newsTool,
}

export const tools = Object.values(toolsByName)
