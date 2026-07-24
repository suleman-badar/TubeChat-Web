# FastAPI Startup Sequence

## Application startup

``` text
Start FastAPI
      │
      ▼
lifespan()
      │
      ▼
initialize_vector_store()
      │
      ▼
Load embeddings
      │
      ▼
Create Chroma
      │
      ▼
Server starts accepting requests
```

During application startup, the `lifespan()` function runs **once**.
Inside it, `initialize_vector_store()` prepares the vector store by
loading the embedding model and creating or opening the persistent
Chroma database. After this initialization is complete, FastAPI begins
accepting incoming requests.

------------------------------------------------------------------------

## Request flow

Every request follows this flow:

``` text
index_transcript()
      │
      ▼
get_vector_store()
      │
      ▼
Return existing instance
```

The vector store is **not recreated** for every request. Instead,
`get_vector_store()` returns the already initialized instance, avoiding
repeated loading of embeddings or reopening the Chroma database. This
improves performance and reduces unnecessary initialization work.

------------------------------------------------------------------------

## Key Idea

-   `initialize_vector_store()` runs **once** during application
    startup.
-   The embedding model and Chroma database are initialized only once.
-   Every request reuses the existing vector store instance.
-   No unnecessary recreation occurs, making the application faster and
    more efficient.
