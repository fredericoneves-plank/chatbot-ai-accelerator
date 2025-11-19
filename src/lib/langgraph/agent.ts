import { StateGraph, START, END } from '@langchain/langgraph'
import { MessagesState } from './state'
import { llmCall, toolNode, shouldContinue } from './nodes'

export const agent = new StateGraph(MessagesState)
  .addNode('llmCall', llmCall)
  .addNode('toolNode', toolNode)
  .addEdge(START, 'llmCall')
  .addConditionalEdges('llmCall', shouldContinue, ['toolNode', END])
  .addEdge('toolNode', 'llmCall')
  .compile()

export { runAgent } from './runAgent'
