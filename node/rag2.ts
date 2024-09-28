import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { embeddings, model } from './model';
import { Document } from '@langchain/core/documents';
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableWithMessageHistory,
  Runnable,
} from "@langchain/core/runnables";
import { ChatPromptTemplate ,MessagesPlaceholder} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import 'faiss-node';
import { HumanMessage } from '@langchain/core/messages';
import 'dotenv/config'
import { JSONChatHistory } from '../JSONChatHistory';
import path from "path";

console.log(process.env.OPENAI_API_KEY);

// process.env.LANGCHAIN_VERBOSE = 'true';

async function run() {
  const directory = '../db/kongyiji';
  const vectorstore = await FaissStore.load(directory, embeddings);

  const retriever = vectorstore.asRetriever(2);

  const convertDocsToString = (documents: Document[]): string => {
    return documents.map((document) => document.pageContent).join('\n');
  };

  const contextRetrieverChain = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
  ]);

  //   // 是可以的
  //   const result = await contextRetriverChain.invoke({
  //     question: '什么是基础设施',
  //   });
  //   console.log('result :', result);

  const SYSTEM_TEMPLATE = `
你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
{question}`;

  const prompt = ChatPromptTemplate.fromTemplate([
    ["system", SYSTEM_TEMPLATE],
    new MessagesPlaceholder("history"),
    ["human", "现在，你需要基于原文，回答以下问题：\n{standalone_question}`"],
  ]

  );

  const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解。",
    ],
    new MessagesPlaceholder("history"),
    ["human", "将以下问题重述为一个独立的问题：\n{question}"],
  ]);


  const rephraseChain = RunnableSequence.from([
    rephraseChainPrompt,
    model,
    new StringOutputParser(),
  ]);


  // 用 llm改写用户问答 => 根据改写后的提问获取文档 => 生成回复 的 rag chain
  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      standalone_question: rephraseChain,
    }),
    RunnablePassthrough.assign({
      context: contextRetrieverChain,
    }),
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const chatHistoryDir = path.join(__dirname, "../chat_data");

  const ragChainWithHistory = new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: (sessionId) => new JSONChatHistory({ sessionId, dir: chatHistoryDir }),
    historyMessagesKey: "history",
    inputMessagesKey: "question",
  });


  const res = await ragChainWithHistory.invoke(
    {
      question: "什么是基础设施？",
    },
    {
      configurable: { sessionId: "test-history" },
    }
  );


  console.log('res :', res);




}

// run();
