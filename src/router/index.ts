// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { authUtils } from '@/utils/authUtils'
import { convertMenuToRoutes, loadMenuData, MenuItem } from '@/utils/routeUtils'

// Define static routes
const staticRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  }
]

// Initialize the router with only static routes
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes
})

// Helper function to get the first route with a component
const getFirstValidRoute = (menus: MenuItem[]): MenuItem | null => {
  // Flatten all menu items
  const allItems: MenuItem[] = []

  for (const menu of menus) {
    if (!menu.parentId || menu.parentId === 0) {
      // Check parent first if it has a component
      if (menu.component) {
        return menu
      }
      // Then check children
      if (menu.children && menu.children.length > 0) {
        for (const child of menu.children) {
          if (child.component) {
            return child
          }
        }
      }
    }
  }

  return null
}

// Navigation guard to check for authentication
router.beforeEach(async (to, from, next) => {
  const isLoginRoute = to.path === '/login'

  // If accessing login route, allow directly
  if (isLoginRoute) {
    // If already logged in, redirect to first valid route
    if (authUtils.isAuthenticated()) {
      // Just let it fall through to load routes and redirect properly
    } else {
      next()
      return
    }
  }

  // Check if token exists
  if (!authUtils.isAuthenticated()) {
    next('/login')
    return
  }

  // Load dynamic routes if not already loaded
  if (router.getRoutes().length <= staticRoutes.length) {
    try {
      const menuData = await loadMenuData()
      const dynamicRoutes = convertMenuToRoutes(menuData)

      // Find the first valid route for default redirect
      const firstRoute = getFirstValidRoute(menuData)
      const defaultPath = firstRoute?.path || '/dashboard'

      // Create a parent route with NavigationLayout
      const layoutRoute: RouteRecordRaw = {
        path: '/',
        component: () => import('../components/layout/NavigationLayout.vue'),
        children: [
          // Redirect root to first valid route
          {
            path: '',
            redirect: defaultPath
          },
          // Add all dynamic routes as children
          ...dynamicRoutes,
          // 404 page inside layout
          {
            path: ':pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('../views/error/NotFound.vue'),
            meta: { title: '页面不存在' }
          }
        ]
      }

      // Add the layout route with all children
      router.addRoute(layoutRoute)

      // If trying to access root, redirect to first route
      if (to.path === '/' || to.path === '') {
        next(defaultPath)
      } else {
        next({ ...to, replace: true })
      }
    } catch (error) {
      console.error('Failed to load routes:', error)
      next('/login')
    }
  } else {
    next()
  }
})

export default router
