import request from '@/utils/request'

// 检查设备状态
export function checkDevStatus(query) {
  return request({
    url: '/device/business/checkDevStatus',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

// 更改设备操作状态
export function changeDevStatus(query) {
  return request({
    url: '/device/business/changeDevStatus',
    method: 'get',
    params: query,
    timeout: 10000
  })
}


// 向设备发送指令: params: {devName: 'xxx', cmd: 'xxx', cmdParam: 'xxx'}
export function writeCmd(query) {
  return request({
    url: '/device/business/writeCmd',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

// 从设备读取参数值: params: {devName: 'xxx', paramKey: 'xxx'}
export function readParam(query) {
  return request({
    url: '/device/business/readParam',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

// 从设备读取一组参数
export function readParams(query) {
  return request({
    url: '/device/business/readParams',
    method: 'post',
    params: query,
    timeout: 10000
  })
}

// 获取设备的运行状态信息
export function getRunStatus(query) {
  return request({
    url: '/device/business/getRunStatus',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

// 获取面板信息
export function getPanelData(query) {
  return request({
    url: '/device/business/getPanelData',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

// 获取设备系统配置信息
export function getSysConfig(query) {
  return request({
    url: '/device/business/getSysConfig',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

// 获取命令执行的结果
export function getCmdResult(query) {
  return request({
    url: '/device/business/getCmdResult',
    method: 'get',
    params: query,
    timeout: 10000
  })
}

