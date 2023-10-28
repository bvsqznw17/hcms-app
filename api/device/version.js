import request from '@/utils/request'

// 查询软件版本列表
export function listVersion(query) {
  return request({
    url: '/device/version/list',
    method: 'get',
    params: query
  })
}

// 查询软件版本详细
export function getVersion(id) {
  return request({
    url: '/device/version/' + id,
    method: 'get'
  })
}

// 新增软件版本
export function addVersion(data) {
  return request({
    url: '/device/version',
    method: 'post',
    data: data
  })
}

// 修改软件版本
export function updateVersion(data) {
  return request({
    url: '/device/version',
    method: 'put',
    data: data
  })
}

// 删除软件版本
export function delVersion(id) {
  return request({
    url: '/device/version/' + id,
    method: 'delete'
  })
}
