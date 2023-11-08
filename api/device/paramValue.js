import request from '@/utils/request'

// 查询设备参数列表
export function listParamValue(query) {
  return request({
    url: '/param/paramValue/list',
    method: 'get',
    params: query
  })
}
// 查询设备参数列表-参数管理
export function listForParam(query) {
  return request({
    url: '/param/paramValue/listForParam',
    method: 'get',
    params: query
  })
}

// 查询设备参数详细
export function getParamValue(id) {
  return request({
    url: '/param/paramValue/' + id,
    method: 'get'
  })
}

// 新增设备参数
export function addParamValue(data) {
  return request({
    url: '/param/paramValue',
    method: 'post',
    data: data
  })
}

// 修改设备参数
export function updateParamValue(data) {
  return request({
    url: '/param/paramValue',
    method: 'put',
    data: data,
    timeout: 30000
  })
}

// 删除设备参数
export function delParamValue(id) {
  return request({
    url: '/param/paramValue/' + id,
    method: 'delete'
  })
}

// 查询-采集指定ip地址数据
export function collData(query) {
  return request({
    url: '/param/paramValue/collData',
    method: 'get',
    params: query
  })
}

// 查询指定斗参数
export function getDouParam(query) {
  return request({
    url: '/param/paramValue/getDouParam',
    method: 'get',
    params: query
  })
}

// 设置指定斗参数
export function setDouParam(data) {
  return request({
    url: '/param/paramValue/setDouParam',
    method: 'put',
    data: data
  })
}

// 采集模块状态数据
export function collModuleStatus(query) {
  return request({
    url: '/param/paramValue/collModuleStatus',
    method: 'get',
    params: query,
    timeout: 60000
  })
}

// 获取模块状态参数
export function getMkParam(query) {
  return request({
    url: '/param/paramValue/getMkParam',
    method: 'get',
    params: query
  })
}

//获取马达模式参数
export function getMotorParam(query) {
  return request({
    url: '/param/paramValue/getMotorParam',
    method: 'get',
    params: query,
    timeout: 60000
  })
}
//获取频率增益参数
export function getPlzyParam(query) {
  return request({
    url: '/param/paramValue/getPlzyParam',
    method: 'get',
    params: query,
    timeout: 60000
  })
}

// 获取输入输出参数
export function getInOutParam(query) {
  return request({
    url: '/param/paramValue/getInOutParam',
    method: 'get',
    params: query
  })
}

// 设置输入输出参数
export function setInOutParam(data) {
  return request({
    url: '/param/paramValue/setInOutParam',
    method: 'put',
    data: data
  })
}

// 设置频率增益参数
export function setPlzyParam(data) {
  return request({
    url: '/param/paramValue/setPlzyParam',
    method: 'put',
    data: data
  })
}
