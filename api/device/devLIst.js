import request from '@/utils/request'

// 查询设备列表列表
export function listDevList(query) {
  return request({
    url: '/device/devList/list',
    method: 'get',
    params: query
  })
}

// 查询设备列表详细
export function getDevList(id) {
  return request({
    url: '/device/devList/' + id,
    method: 'get'
  })
}

// 新增设备列表
export function addDevList(data) {
  return request({
    url: '/device/devList',
    method: 'post',
    data: data
  })
}

// 修改设备列表
export function updateDevList(data) {
  return request({
    url: '/device/devList',
    method: 'put',
    data: data
  })
}

// 删除设备列表
export function delDevList(id) {
  return request({
    url: '/device/devList/' + id,
    method: 'delete'
  })
}
