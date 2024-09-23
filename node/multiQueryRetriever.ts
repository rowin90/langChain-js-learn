import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";
import { LLM,embeddings } from './model'
import "faiss-node";
import "dotenv/config";

async function run() {
  const directory = "../db/kongyiji";
  const vectorstore = await FaissStore.load(directory, embeddings);

  const retriever = MultiQueryRetriever.fromLLM({
    llm: LLM,
    retriever: vectorstore.asRetriever(3),
    queryCount: 3,
    verbose: true,
  });
  const res = await retriever.invoke("事故是怎么产生的");

  console.log(res);
}

run();