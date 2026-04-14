import request from '@/utils/request.js'

export function getStrategies(){
  return request({
    url: '/strategy/list',
    method: 'get'
  })
}

export function getStrategyDetail(id){
  return request({
    url: '/strategy/detail',
    params: { id },
    method: 'get'
  })
}

export function createStrategy(data){
  return request({
    url: '/strategy/create',
    data,
    method: 'post'
  })
}