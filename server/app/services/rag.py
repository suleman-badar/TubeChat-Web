from functools import lru_cache
import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableLambda, RunnableParallel
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


def create_rag_pipeline(retriever):
    """Create a simple LCEL RAG pipeline that formats context+question and calls the LLM."""
    prompt = PromptTemplate(
        template=(
            "You are a helpful assistant that answers questions based on the following retrieved data.\n"
            "If the context is insufficient to answer the question, say you don't know.\n\n"
            "Context:\n{context}\n\nQuestion: {question}"
        ),
        input_variables=["context", "question"],
    )

    llm = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "openai.gpt-oss-20b"),
        temperature=0,
    )

    question = RunnableLambda(lambda inputs: inputs["question"])
    retrieve_documents = RunnableLambda(
        lambda inputs: retriever.invoke(inputs["question"])
    )

    rag_pipeline = (
        RunnableParallel(
            context=retrieve_documents
            | RunnableLambda(lambda docs: "\n".join(doc.page_content for doc in docs)),
            question=question,
        )
        | prompt
        | llm
    )

    return rag_pipeline, prompt, llm
