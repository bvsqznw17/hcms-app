import request from '@/utils/request'

// 查询下载列表列表
export function listDownloadList(query) {
  return request({
    url: '/device/DownloadList/list',
    method: 'get',
    params: query
  })
}

// 查询下载列表-userId
export function listDownloadListByUserId(query) {
  return request({
    url: '/device/DownloadList/listByUserId',
    method: 'get',
    params: query
  })
}

// 查询下载列表详细
export function getDownloadList(id) {
  return request({
    url: '/device/DownloadList/' + id,
    method: 'get'
  })
}

// 新增下载列表
export function addDownloadList(data) {
  return request({
    url: '/device/DownloadList',
    method: 'post',
    data: data
  })
}

// 修改下载列表
export function updateDownloadList(data) {
  return request({
    url: '/device/DownloadList',
    method: 'put',
    data: data
  })
}

// 删除下载列表
export function delDownloadList(id) {
  return request({
    url: '/device/DownloadList/' + id,
    method: 'delete'
  })
}
