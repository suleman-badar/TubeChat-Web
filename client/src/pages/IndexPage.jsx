import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IndexForm } from '../components/IndexForm'
import { indexVideo } from '../services/api'

function formatError(error) {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
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
      // console.log('Index video response:', data)

      if (data?.youtube_id) {
        setResult({ youtubeId: data.youtube_id, message: 'Video indexed successfully. Redirecting...' })
        reset()
        // Wait a short moment so they see the success state
        setTimeout(() => {
          navigate(`/chat?youtube_id=${encodeURIComponent(data.youtube_id)}`)
        }, 1200)
        return
      }

      setResult({ youtubeId: '', message: 'Video indexed, but no youtube_id was returned.' })
    } catch (caughtError) {
      setApiError(formatError(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full w-full overflow-y-auto items-center justify-center bg-tc-bg px-4 py-6 text-tc-text sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl rounded-3xl border border-tc-border bg-gradient-to-br from-tc-surface/95 via-tc-surface to-tc-bg-2/90 p-6 shadow-[0_28px_90px_-40px_rgba(0,0,0,0.9)] sm:p-8 lg:p-10">
        <div className="mb-6 space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-tc-text sm:text-4xl">Index YouTube Video</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-tc-muted sm:text-base">
            Provide a YouTube link. We'll fetch the transcript, chunk it, embed it, and make it ready for instant AI-powered chatting.
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
      </div>
    </div>
  )
}