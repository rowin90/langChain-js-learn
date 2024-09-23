import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { ChatOpenAI } from '@langchain/openai';

export const embeddings = new OllamaEmbeddings({
  model: 'llama3.1', // default value
  baseUrl: 'http://localhost:11434', // default value
  requestOptions: {
    useMMap: true, // use_mmap 1
    numThread: 10, // num_thread 10
    numGpu: 1, // num_gpu 1
  },
});


export const model = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.shellgpt.top/v1',
  },
});
