import { useMemo } from 'react'

export function useVideoId() {
  return useMemo(() => new URLSearchParams(window.location.search).get('video_id') || '', [])
}