from fastapi import Request
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


def get_llm(request: Request) -> ChatOpenAI:
    """Retrieve the LLM instance from the FastAPI app state."""
    return request.app.state.llm


def get_prompt(request: Request) -> ChatPromptTemplate:
    """Retrieve the prompt from the FastAPI app state."""
    return request.app.state.prompt
