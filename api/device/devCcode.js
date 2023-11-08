import request from '@/utils/request'

// 查询连接码列表
export function listCcode(query) {
    return request({
        url: '/device/ccode/list',
        method: 'get',
        params: query
    })
}

// 查询连接码详细
export function getCcode(userId) {
    return request({
        url: '/device/ccode/' + userId,
        method: 'get'
    })
}

// 新增连接码
export function addCcode(data) {
    return request({
        url: '/device/ccode',
        method: 'post',
        data: data
    })
}

// 修改连接码
export function updateCcode(data) {
    return request({
        url: '/device/ccode',
        method: 'put',
        data: data
    })
}

// 删除连接码
export function delCcode(userId) {
    return request({
        url: '/device/ccode/' + userId,
        method: 'delete'
    })
}

// 验证连接码
export function verifyCcode(data) {
    return request({
        url: '/device/ccode/verifyCcode',
        method: 'post',
        data: data
    })
}