import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { IndexForm } from '../components/IndexForm'
import { indexVideo } from '../services/api'
import { ChatSidebar } from '../components/ChatSidebar'

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
    reset() // it will reset the form fields to their default values that is empty string in this case. So the input field will be cleared after submission.
    setIsLoading(true)
    setApiError('')
    setResult(null)

    try {
      const data = await indexVideo(videoUrl)
      console.log('Index video response:', data)

      if (data?.youtube_id) {
        const nextUrl = `/chat?youtube_id=${encodeURIComponent(data.youtube_id)}`
        setResult({ youtubeId: data.youtube_id, message: 'Video indexed successfully.' })
        reset()
        navigate(nextUrl)
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
    <section className="page-card hero-card">
      <div >
      <ChatSidebar youtubeId={result?.youtubeId} navigate={navigate} />
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