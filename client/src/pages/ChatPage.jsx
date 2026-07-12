import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChatComposer } from '../components/ChatComposer'
import { ChatMessageList } from '../components/ChatMessageList'
import { ChatSidebar } from '../components/ChatSidebar'
import { chatWithVideo } from '../services/api'
import { useVideoId } from '../hooks/useVideoId'

function formatError(error) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export function ChatPage({ navigate }) {
  const videoId = useVideoId()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [messages, setMessages] = useState([])
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      question: '',
    },
  })

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const onSubmit = async ({ question }) => {
    if (!videoId) {
      setApiError('No video_id found in the URL. Go back and index a video first.')
      return
    }

    setIsLoading(true)
    setApiError('')

    const userMessage = { role: 'user', content: question }
    setMessages((currentMessages) => [...currentMessages, userMessage])

    try {
      const data = await chatWithVideo(videoId, question)

      const answerContent =
        typeof data?.response === 'string'
          ? data.response
          : data?.response?.content || JSON.stringify(data?.response || data)

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: answerContent },
      ])
      reset()
    } catch (caughtError) {
      setApiError(formatError(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="page-card chat-layout chat-shell">
      <ChatSidebar videoId={videoId} navigate={navigate} />

      <section className="panel chat-panel">
        <ChatMessageList messages={messages} />

        <ChatComposer
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isLoading}
          isDisabled={!videoId}
          apiError={apiError}
        />
      </section>
    </section>
  )
}