import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { embeddings } from './model';
import "faiss-node";

async function run() {
  const directory = "../db/kongyiji";
  const vectorstore = await FaissStore.load(directory, embeddings);

  const retriever = vectorstore.asRetriever(2);
  const res = await retriever.invoke("事故是怎么产生的");

  console.log(res);
}

run();