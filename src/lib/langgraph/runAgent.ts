import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { agent } from './agent'

export async function runAgent(
  userMessage: string,
  conversationHistory: any[] = []
): Promise<string> {
  const langchainMessages = conversationHistory.map((msg: any) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content)
    }
    return new AIMessage(msg.content)
  })

  langchainMessages.push(new HumanMessage(userMessage))

  // Use invoke() to get the full response
  const result = await agent.invoke({
    messages: langchainMessages,
  })

  // Extract the final AI message content
  const lastMessage = result.messages[result.messages.length - 1]
  if (lastMessage instanceof AIMessage) {
    const content = lastMessage.content
    return typeof content === 'string' ? content : String(content)
  }

  return ''
}
