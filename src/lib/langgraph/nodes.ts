import { SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages'
import { END } from '@langchain/langgraph'
import { modelWithTools } from './model'
import { toolsByName } from './tools'
import type { MessagesStateType } from './state'

export async function llmCall(state: MessagesStateType) {
  return {
    messages: await modelWithTools.invoke([
      new SystemMessage(
        `You are a helpful, sarcastic assistant with access to weather and news information. 
You can help users by:
- Getting current weather for any location
- Fetching the latest news on any topic

Be helpful but add a bit of sarcasm and wit to your responses. Don't be mean, just clever and amusing.`
      ),
      ...state.messages,
    ]),
  }
}

export async function toolNode(state: MessagesStateType) {
  const lastMessage = state.messages.at(-1)

  if (lastMessage == null || !(lastMessage instanceof AIMessage)) {
    return { messages: [] }
  }

  const result: ToolMessage[] = []
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name]
    if (tool && toolCall.id) {
      const observation = await (tool as any).invoke(toolCall)
      result.push(observation)
    }
  }

  return { messages: result }
}

export async function shouldContinue(state: MessagesStateType) {
  const lastMessage = state.messages.at(-1)
  if (lastMessage == null || !(lastMessage instanceof AIMessage)) return END

  if (lastMessage.tool_calls?.length) {
    return 'toolNode'
  }

  return END
}
