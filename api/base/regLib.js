import request from '@/utils/request'

// 查询基础库配置列表
export function listRegLib(query) {
  return request({
    url: '/base/regLib/list',
    method: 'get',
    params: query
  })
}

// 查询基础库配置详细
export function getRegLib(id) {
  return request({
    url: '/base/regLib/' + id,
    method: 'get'
  })
}

// 新增基础库配置
export function addRegLib(data) {
  return request({
    url: '/base/regLib',
    method: 'post',
    data: data
  })
}

// 修改基础库配置
export function updateRegLib(data) {
  return request({
    url: '/base/regLib',
    method: 'put',
    data: data
  })
}

// 删除基础库配置
export function delRegLib(id) {
  return request({
    url: '/base/regLib/' + id,
    method: 'delete'
  })
}
