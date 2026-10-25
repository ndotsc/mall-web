import request from './request.js'

export const login = (username, password) =>
  request.post('/auth/login', { username, password })

export const register = (username, password, nickname) =>
  request.post('/auth/register', { username, password, nickname })

export const me = () => request.get('/auth/me')
