import { ChatAnthropic } from '@langchain/anthropic'
import { tools } from './tools'

export const model = new ChatAnthropic({
  model: 'claude-sonnet-4-5-20250929',
  temperature: 0.7,
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const modelWithTools = model.bindTools(tools)
