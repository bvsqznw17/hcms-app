import request from '@/utils/request'


// 获取菜单信息
export function getMenuData() {
  return request({
    url: '/system/menu/getMenuData',
    method: 'get'
  })
}
