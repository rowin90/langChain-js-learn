# LangChain-js

1. jupyter 用 deno 的内核版本
2. 因为 faiss 做本地向量存储，和 deno 有不兼容的，和本地向量数据库的代码放在，在node项目中，其他的都在 jupyter 中
3. 模型用了本地 Ollma，和代理的 openai，推荐还是 openai 较好
4. 一些外部的依赖需要自己注册 api，如 LangSmith，SerpApi等，放在 .env中