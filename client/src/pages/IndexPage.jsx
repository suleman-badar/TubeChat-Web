import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IndexForm } from '../components/IndexForm'
import { indexVideo } from '../services/api'

function formatError(error) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export function IndexPage({ navigate }) {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      videoUrl: '',
    },
  })

  const onSubmit = async ({ videoUrl }) => {
    setIsLoading(true)
    setApiError('')
    setResult(null)

    try {
      const data = await indexVideo(videoUrl)

      if (data?.video_id) {
        const nextUrl = `/chat?video_id=${encodeURIComponent(data.video_id)}`
        setResult({ videoId: data.video_id, message: 'Video indexed successfully.' })
        reset()
        navigate(nextUrl)
        return
      }

      setResult({ videoId: '', message: 'Video indexed, but no video_id was returned.' })
    } catch (caughtError) {
      setApiError(formatError(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-card hero-card">
      <div className="hero-copy">
        <p className="eyebrow">Step 1</p>
        <h2>Index a YouTube video</h2>
        <p className="lead">
          Paste a YouTube URL, create embeddings on the server, and store the chunks in your
          persistent vector database.
        </p>
      </div>

      <IndexForm
        register={register}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
        apiError={apiError}
        result={result}
      />
    </section>
  )
}