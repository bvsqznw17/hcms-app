import request from '@/utils/request'

// 查询设备参数修改日志列表
export function listDevChangeLog(query) {
  return request({
    url: '/statistic/devChangeLog/list',
    method: 'get',
    params: query
  })
}

// 查询设备参数修改日志详细
export function getDevChangeLog(id) {
  return request({
    url: '/statistic/devChangeLog/' + id,
    method: 'get'
  })
}

// 新增设备参数修改日志
export function addDevChangeLog(data) {
  return request({
    url: '/statistic/devChangeLog',
    method: 'post',
    data: data
  })
}

// 修改设备参数修改日志
export function updateDevChangeLog(data) {
  return request({
    url: '/statistic/devChangeLog',
    method: 'put',
    data: data
  })
}

// 删除设备参数修改日志
export function delDevChangeLog(id) {
  return request({
    url: '/statistic/devChangeLog/' + id,
    method: 'delete'
  })
}
