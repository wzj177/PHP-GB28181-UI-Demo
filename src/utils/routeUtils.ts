import { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getComponent } from '@/views/pages'

// Define the menu item type
export interface MenuItem {
  id: string
  name: string
  icon?: string
  path: string
  component?: string
  title: string
  parentId: number | string
  sort: number
  type?: 'menu' | 'directory' | 'path' | 'api'
  children?: MenuItem[]
  meta?: Record<string, any>
}

// Load menu data from JSON file
export const loadMenuData = async (): Promise<MenuItem[]> => {
  try {
    // In a real application, this would come from an API call
    // For now, we'll use a static import
    const menuData = await import('@/config/menu.json')
    return menuData.default.menus as MenuItem[]
  } catch (error) {
    console.error('Failed to load menu data:', error)
    ElMessage.error('加载菜单数据失败')
    return []
  }
}

/**
 * 将菜单项转换为路由记录（递归处理，参考 Vue2 mapRoutes）
 * @param menus 菜单项数组
 * @returns 路由记录数组
 */
export const convertMenuToRoutes = (menus: MenuItem[]): RouteRecordRaw[] => {
  return mapMenuToRoutes(menus)
}

/**
 * 递归映射菜单到路由（参考 Vue2 的 mapRoutes 模式）
 * @param menus 菜单项数组
 * @param skipParentCheck 是否跳过 parentId 检查（用于递归子菜单）
 * @param level 层级深度（用于调试）
 * @returns 路由记录数组
 */
function mapMenuToRoutes(menus: MenuItem[], skipParentCheck: boolean = false, level: number = 0): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  menus.forEach((menu) => {
    // 跳过 api 类型 - 这些仅用于 RBAC 权限控制，不生成路由
    if (menu.type === 'api') {
      console.log(`Skipping API type menu item (RBAC only):`, menu)
      return
    }

    // 只在顶层跳过非顶级菜单项（parentId 不为 0 且不是数字 0 的项）
    // 当递归处理子菜单时，跳过此检查
    if (!skipParentCheck && menu.parentId && menu.parentId !== 0) {
      console.log(`Skipping non-top-level menu item at level ${level}:`, menu)
      return
    }

    const route: RouteRecordRaw = {
      path: menu.path, // 保持原路径（保留前导斜杠）
      name: menu.id,
      meta: {
        title: menu.title,
        icon: menu.icon,
        ...menu.meta
      }
    }

    // 如果有 component 配置，则从 pages 映射表获取组件
    if (menu.component) {
      route.component = getComponent(menu.component)
    }

    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      // 过滤掉 api 类型的子菜单（仅用于 RBAC，不生成路由）
      const nonApiChildren = menu.children.filter(child => child.type !== 'api')

      const childRoutes = nonApiChildren.map(child => {
        // 如果子菜单路径是绝对路径（以 / 开头），保持原样作为独立路由
        // 如果是相对路径，则移除前导斜杠作为嵌套路由
        const childPath = child.path.startsWith('/') ? child.path : child.path.replace(/^\//, '')

        const childRoute: RouteRecordRaw = {
          path: childPath,
          name: child.id,
          meta: {
            title: child.title,
            icon: child.icon,
            ...child.meta
          }
        }

        // 子菜单也从 pages 映射表获取组件
        if (child.component) {
          childRoute.component = getComponent(child.component)
        }

        // 支持子菜单的子菜单（递归）
        if (child.children && child.children.length > 0) {
          // 过滤掉 api 类型的孙菜单（仅用于 RBAC，不生成路由）
          const nonApiGrandchildren = child.children.filter(grandchild => grandchild.type !== 'api')

          childRoute.children = nonApiGrandchildren.map(grandchild => {
            const grandchildPath = grandchild.path.startsWith('/') ? grandchild.path : grandchild.path.replace(/^\//, '')
            return {
              path: grandchildPath,
              name: grandchild.id,
              meta: {
                title: grandchild.title,
                icon: grandchild.icon,
                ...grandchild.meta
              },
              component: grandchild.component ? getComponent(grandchild.component) : undefined
            }
          })
        }

        return childRoute
      })

      // 区分绝对路径和相对路径的子路由
      // 绝对路径的子路由应该作为独立的顶级路由
      // 相对路径的子路由作为父路由的嵌套路由
      const absoluteChildRoutes = childRoutes.filter(r => r.path.startsWith('/'))
      const relativeChildRoutes = childRoutes.filter(r => !r.path.startsWith('/'))

      // 如果父级有组件，将相对路径的子路由添加到 children
      if (route.component) {
        route.children = relativeChildRoutes.length > 0 ? relativeChildRoutes : undefined
      } else {
        // 父级作为重定向（指向第一个相对路径的子路由）
        if (relativeChildRoutes.length > 0) {
          route.redirect = relativeChildRoutes[0].path
        }
      }

      // 将父路由和所有子路由（包括绝对路径的）都添加到 routes
      routes.push(route, ...absoluteChildRoutes)
      return
    }

    routes.push(route)
  })

  return routes
}

/**
 * 过滤路由（基于用户权限）
 * 简化版本，实际项目中根据用户权限过滤
 */
export const filterRoutesByPermissions = (routes: RouteRecordRaw[], permissions: string[]): RouteRecordRaw[] => {
  // 实际应用中会检查用户权限
  return routes
}

/**
 * 获取子路由
 */
export const getChildrenRoutes = (parentRoute: RouteRecordRaw): RouteRecordRaw[] => {
  return parentRoute.children || []
}