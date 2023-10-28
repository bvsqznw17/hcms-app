import request from '@/utils/request'

// 查询设备信息列表
export function listDevMsg(query) {
  return request({
    url: '/device/devMsg/list',
    method: 'get',
    params: query
  })
}

// 查询设备信息列表
export function listDevMsgEx(query) {
  return request({
    url: '/device/devMsg/listEx',
    method: 'get',
    params: query
  })
}

// 查询设备信息详细
export function getDevMsg(id) {
  return request({
    url: '/device/devMsg/' + id,
    method: 'get'
  })
}

// 新增设备信息
export function addDevMsg(data) {
  return request({
    url: '/device/devMsg',
    method: 'post',
    data: data
  })
}

// 修改设备信息
export function updateDevMsg(data) {
  return request({
    url: '/device/devMsg',
    method: 'put',
    data: data
  })
}

// 删除设备信息
export function delDevMsg(id) {
  return request({
    url: '/device/devMsg/' + id,
    method: 'delete'
  })
}

