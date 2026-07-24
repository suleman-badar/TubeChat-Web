from functools import lru_cache
import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda, RunnableParallel
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def get_prompt():
    """Return a cached ChatPromptTemplate for RAG."""
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are a helpful assistant that answers questions based on the
        provided transcript.
    
        Use the retrieved context to answer.
    
        If the context is insufficient,go for websearch, if there is no authenticated source say you don't know.
        """,
            ),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            (
                "human",
                "Context:\n{context}\n\nQuestion: {question}",
            ),
        ]
    )


@lru_cache(maxsize=1)
def get_llm() -> ChatOpenAI:
    """Return a cached ChatOpenAI instance for RAG."""
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "openai.gpt-oss-20b"),
        temperature=0,
    )


def create_rag_pipeline(retriever):
    """Create a simple LCEL RAG pipeline that formats context+question and calls the LLM."""

    prompt = get_prompt()
    llm = get_llm()

    question = RunnableLambda(lambda inputs: inputs["question"])

    async def retrieve_documents_async(inputs):
        return await retriever.ainvoke(inputs["question"])

    retrieve_documents = RunnableLambda(retrieve_documents_async)

    rag_pipeline = (
        RunnableParallel(
            context=retrieve_documents
            | RunnableLambda(lambda docs: "\n".join(doc.page_content for doc in docs)),
            question=question,
            chat_history=RunnableLambda(lambda inputs: inputs.get("chat_history")),
        )
        | prompt
        | llm
    )

    return rag_pipeline
