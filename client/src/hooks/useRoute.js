import { useEffect, useState } from 'react'

function getRoute(pathname) {
  if (pathname === '/chat') {
    return 'chat'
  }

  return 'index'
}

export function useRoute() {
  const [route, setRoute] = useState(() => getRoute(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRoute(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setRoute(getRoute(window.location.pathname))
  }

  return { route, navigate }
}