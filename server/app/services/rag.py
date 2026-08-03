import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableLambda, RunnableParallel
from dotenv import load_dotenv

load_dotenv()



def build_embeddings():
    return OpenAIEmbeddings(model="text-embedding-3-small")


def build_prompt():
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


def build_llm() -> ChatOpenAI:
    """Return a cached ChatOpenAI instance for RAG."""
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "openai.gpt-oss-20b"),
        temperature=0,
    )


def create_rag_pipeline(retriever, llm: ChatOpenAI, prompt: ChatPromptTemplate):
    """Create a simple LCEL RAG pipeline that formats context+question and calls the LLM."""

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
