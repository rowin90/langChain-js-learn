import { FaissStore } from '@langchain/community/vectorstores/faiss';
import { embeddings } from './model';
import { Document } from '@langchain/core/documents';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
// import { StringOutputParser } from "@langchain/core/output_parsers";
import 'faiss-node';
import { HumanMessage } from '@langchain/core/messages';

// require('dotenv').config({})

// const chatModel = new ChatOpenAI();

// console.log(process.env.OPENAI_API_KEY);

// async function run1() {
//   await chatModel.invoke([
//     new HumanMessage("Tell me a joke")
//   ])
// }

// run1()

async function run() {
  const directory = '../db/kongyiji';
  const vectorstore = await FaissStore.load(directory, embeddings);

  const retriever = vectorstore.asRetriever(2);

  const convertDocsToString = (documents: Document[]): string => {
    return documents.map((document) => document.pageContent).join('\n');
  };

  const contextRetriverChain = RunnableSequence.from([
    (input) => input.question,
    retriever,
    convertDocsToString,
  ]);

  // 是可以的
  const result = await contextRetriverChain.invoke({
    question: '什么是基础设施',
  });
  console.log('result :', result);

  const TEMPLATE = `
你是一个本次事故的分析者，根据文章详细解释和回答问题，你在回答时会引用作品原文。
并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
{question}`;

  const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);

  // console.log('构建 ragChain',await prompt.format({
  //   context:'1',
  //   question:1
  // }));


  // const ragChain = RunnableSequence.from([
  //   {
  //     context: contextRetriverChain,
  //     question: (input) => input.question,
  //   },
  //   prompt,
  //   chatModel
  //   // new StringOutputParser()
  // ]);

  // console.log('开始调用',ragChain);

  // const answer = await ragChain.invoke({
  //   question: '今天是哪一天',
  // });

  // console.log(answer);
}

run()
