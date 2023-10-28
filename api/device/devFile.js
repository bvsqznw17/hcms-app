import request from '@/utils/request'

// 查询设备文件列表
export function listDevFile(query) {
  return request({
    url: '/device/devFile/list',
    method: 'get',
    params: query
  })
}

// 查询设备文件页面展示列表
export function getDevFilePageList(query) {
  return request({
    url: '/device/devFile/getDevFilePageList',
    method: 'get',
    params: query
  })
}

// 查询设备文件详细
export function getDevFile(id) {
  return request({
    url: '/device/devFile/' + id,
    method: 'get'
  })
}

// 新增设备文件
export function addDevFile(data) {
  return request({
    url: '/device/devFile',
    method: 'post',
    data: data
  })
}

// 修改设备文件
export function updateDevFile(data) {
  return request({
    url: '/device/devFile',
    method: 'put',
    data: data
  })
}

// 删除设备文件
export function delDevFile(id) {
  return request({
    url: '/device/devFile/' + id,
    method: 'delete'
  })
}

// 导出设备文件
export function exportDevFile(query) {
  return request({
    url: '/device/devFile/export',
    method: 'get',
    params: query
  })
}

// 上传设备文件
export function uploadDevFile(data) {
  return request({
    url: '/device/devFile/uploadDevFile',
    method: 'post',
    data: data
  })
}

// 下载设备文件
export function downloadDevFile(query) {
  return request({
    url: '/device/devFile/downloadDevFile',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

// 批量下载设备文件
export function batchDownloadDevFile(ids) {
  return request({
    url: '/device/devFile/batchDownloadDevFile/' + ids,
    method: 'get',
    // params: query,
    responseType: 'blob'
  })
}

// 获取设备文件url列表
export function getUrlList(query) {
  return request({
    url: '/device/devFile/getUrlList',
    method: 'get',
    params: query
  })
}

// 获取文件下载url
export function getDownloadUrl(query) {
  return request({
    url: '/device/devFile/getDownloadUrl',
    method: 'get',
    params: query
  })
}