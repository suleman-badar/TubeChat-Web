import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'


export async function indexVideo(videoURL) {
  const response = await axios.post(`${API_BASE_URL}/videos/index`, {
    videoURL
  })

  return response.data
}

export async function chatWithVideo(video_id, question) {
  const response = await axios.post(`${API_BASE_URL}/chat/`, {
    video_id,
    question
  })

  return response.data
}
