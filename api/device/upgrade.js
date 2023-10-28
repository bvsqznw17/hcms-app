import request from '@/utils/request'

// 查询软件升级列表
export function listUpgrade(query) {
  return request({
    url: '/device/upgrade/list',
    method: 'get',
    params: query
  })
}

// 查询软件升级详细
export function getUpgrade(id) {
  return request({
    url: '/device/upgrade/' + id,
    method: 'get'
  })
}

// 新增软件升级
export function addUpgrade(data) {
  return request({
    url: '/device/upgrade',
    method: 'post',
    data: data
  })
}

// 修改软件升级
export function updateUpgrade(data) {
  return request({
    url: '/device/upgrade',
    method: 'put',
    data: data
  })
}

// 删除软件升级
export function delUpgrade(id) {
  return request({
    url: '/device/upgrade/' + id,
    method: 'delete'
  })
}

// 升级到最新版本
export function upgradeToNew(data) {
  return request({
    url: '/device/upgrade/upgradeToNew',
    method: 'put',
	data: data,
	timeout: 300000
  })
}