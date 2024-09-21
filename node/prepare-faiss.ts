import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { embeddings } from './model';

const run = async () => {
  const loader = new TextLoader("../data/qiu.txt");
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
  });

  const splitDocs = await splitter.splitDocuments(docs);
  console.log('splitDocs :', splitDocs);

  console.log('开始创建 vectorStore');
  const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);

  const directory = "../db/kongyiji";
  console.log('准备存入 vectorStore');
  await vectorStore.save(directory);
  console.log('完成');
};

run();