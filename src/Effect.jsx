import { memo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useEffectExceptOnMount from 'use-effect-except-on-mount'
import { instance } from '$api'
import setSocket from '$socket'
import User from '$slice/User'
import Tasks from '$slice/Tasks'
import Settings from '$slice/Settings'
let prevJwt

export const setLocalStroage = (key, data = null) => {
  if (data === null) {
    return localStorage.removeItem(key)
  }
  localStorage.setItem(key, data)
}

const Effect = ({ hue, jwt }) => {
  const theme = useSelector((state) => state.settings.theme)
  const socketId = useSelector((state) => state.user.socketId)

  // JWT change
  useEffect(() => {
    instance.defaults.headers.common.authorization = jwt
      ? `Bearer ${jwt}`
      : undefined
    setSocket(jwt)

    prevJwt = jwt
    setLocalStroage('jwt-token', jwt)
  }, [jwt])

  // Logout
  useEffectExceptOnMount(() => {
    if (jwt) return
    $store(User.initial())
    $store(Tasks.initial())
    $store(Settings.initial())
  }, [jwt])

  // Sync JWT With localStorage
  useEffect(() => {
    clearInterval(window.__running_Interval_For_Jwt)
    window.__running_Interval_For_Jwt = setInterval(() => {
      const jwt = localStorage.getItem('jwt-token')
      if (jwt === prevJwt) return
      $store(User.jwt(jwt))
    }, 1000)
  }, [])

  // Update sockeid
  useEffect(() => {
    instance.defaults.headers.common['exclude-socket'] = socketId
  }, [socketId])

  // Update theme
  useEffect(() => {
    document.documentElement.setAttribute(
      'theme',
      theme ? (theme.endsWith('dark') ? 'dark' : 'light') : 'light'
    )
    setLocalStroage(
      'app-theme',
      theme && theme.startsWith('auto') ? 'auto' : theme
    )
  }, [theme])

  // Update theme
  useEffect(() => {
    setLocalStroage('app-theme-hue', hue)
  }, [hue])

  return <></>
}

export default memo(Effect)
