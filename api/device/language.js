import request from '@/utils/request'

// 查询语言包管理列表
export function listLanguage(query) {
  return request({
    url: '/device/language/list',
    method: 'get',
    params: query
  })
}

// 查询语言包管理详细
export function getLanguage(id) {
  return request({
    url: '/device/language/' + id,
    method: 'get'
  })
}

// 新增语言包管理
export function addLanguage(data) {
  return request({
    url: '/device/language',
    method: 'post',
    data: data
  })
}

// 修改语言包管理
export function updateLanguage(data) {
  return request({
    url: '/device/language',
    method: 'put',
    data: data
  })
}

// 删除语言包管理
export function delLanguage(id) {
  return request({
    url: '/device/language/' + id,
    method: 'delete'
  })
}

// 更新语言包
export function upgradeLanguage(data) {
  return request({
    url: '/device/language/upgradeLanguage',
    method: 'put',
	data: data
  })
}