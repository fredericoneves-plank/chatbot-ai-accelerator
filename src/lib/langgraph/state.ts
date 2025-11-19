import '@langchain/langgraph/zod'
import { MessagesZodMeta } from '@langchain/langgraph'
import { registry } from '@langchain/langgraph/zod'
import { type BaseMessage } from '@langchain/core/messages'
import * as z from 'zod'

export const MessagesState = z.object({
  messages: z
    .array(z.custom<BaseMessage>())
    .register(registry, MessagesZodMeta),
})

export type MessagesStateType = z.infer<typeof MessagesState>
