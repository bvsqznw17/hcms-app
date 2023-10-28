import request from '@/utils/request'

// 查询系统设置列表
export function listSettings(query) {
    return request({
        url: '/device/settings/list',
        method: 'get',
        params: query
    })
}

// 查询系统设置详细
export function getSettings(id) {
    return request({
        url: '/device/settings/' + id,
        method: 'get'
    })
}

// 新增系统设置
export function addSettings(data) {
    return request({
        url: '/device/settings',
        method: 'post',
        data: data
    })
}

// 修改系统设置
export function updateSettings(data) {
    return request({
        url: '/device/settings',
        method: 'put',
        data: data
    })
}

// 删除系统设置
export function delSettings(id) {
    return request({
        url: '/device/settings/' + id,
        method: 'delete'
    })
}
