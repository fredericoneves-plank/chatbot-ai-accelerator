import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { agent } from './agent'

export async function runAgent(
  userMessage: string,
  conversationHistory: any[] = []
) {
  const langchainMessages = conversationHistory.map((msg: any) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content)
    }
    return new AIMessage(msg.content)
  })

  langchainMessages.push(new HumanMessage(userMessage))

  const result = await agent.invoke({
    messages: langchainMessages,
  })
  console.log('result', result)
  const finalMessage = result.messages[result.messages.length - 1]
  return finalMessage instanceof AIMessage ? finalMessage.content : ''
}
