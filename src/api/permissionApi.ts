import request from '@/utils/request';

/**
 * 权限管理 API
 */
export const permissionApi = {
  // ================= 用户管理 =================

  /**
   * 获取用户列表
   * GET /admin/permission/users
   */
  getUsers: (params?: {
    keyword?: string;
    status?: string;
    role_id?: number;
    page?: number;
    limit?: number;
  }) => {
    return request.get('/admin/permission/users', { params });
  },

  /**
   * 获取用户详情
   * GET /admin/permission/users/:id
   */
  getUser: (id: number) => {
    return request.get(`/admin/permission/users/${id}`);
  },

  /**
   * 创建用户
   * POST /admin/permission/users
   */
  createUser: (data: {
    username: string;
    password: string;
    email?: string;
    phone?: string;
    real_name?: string;
    role_id: number;
    status?: string;
  }) => {
    return request.post('/admin/permission/users', data);
  },

  /**
   * 更新用户
   * PUT /admin/permission/users/:id
   */
  updateUser: (id: number, data: any) => {
    return request.put(`/admin/permission/users/${id}`, data);
  },

  /**
   * 删除用户
   * DELETE /admin/permission/users/:id
   */
  deleteUser: (id: number) => {
    return request.delete(`/admin/permission/users/${id}`);
  },

  // ================= 角色管理 =================

  /**
   * 获取角色列表
   * GET /admin/permission/roles
   */
  getRoles: (params?: {
    page?: number;
    limit?: number;
  }) => {
    return request.get('/admin/permission/roles', { params });
  },

  /**
   * 获取角色详情
   * GET /admin/permission/roles/:id
   */
  getRole: (id: number) => {
    return request.get(`/admin/permission/roles/${id}`);
  },

  /**
   * 创建角色
   * POST /admin/permission/roles
   */
  createRole: (data: {
    name: string;
    code: string;
    description?: string;
    status?: string;
    menu_ids?: number[];
  }) => {
    return request.post('/admin/permission/roles', data);
  },

  /**
   * 更新角色
   * PUT /admin/permission/roles/:id
   */
  updateRole: (id: number, data: any) => {
    return request.put(`/admin/permission/roles/${id}`, data);
  },

  /**
   * 删除角色
   * DELETE /admin/permission/roles/:id
   */
  deleteRole: (id: number) => {
    return request.delete(`/admin/permission/roles/${id}`);
  },

  /**
   * 获取角色的菜单权限
   * GET /admin/permission/roles/:id/menus
   */
  getRoleMenus: (id: number) => {
    return request.get(`/admin/permission/roles/${id}/menus`);
  },

  /**
   * 更新角色的菜单权限
   * PUT /admin/permission/roles/:id/menus
   */
  updateRoleMenus: (id: number, menu_ids: number[]) => {
    return request.put(`/admin/permission/roles/${id}/menus`, { menu_ids });
  },

  // ================= 菜单管理 =================

  /**
   * 获取菜单列表
   * GET /admin/permission/menus
   */
  getMenus: () => {
    return request.get('/admin/permission/menus');
  },

  /**
   * 获取菜单详情
   * GET /admin/permission/menus/:id
   */
  getMenu: (id: string) => {
    return request.get(`/admin/permission/menus/${id}`);
  },

  /**
   * 创建菜单
   * POST /admin/permission/menus
   */
  createMenu: (data: {
    name: string;
    icon?: string;
    path: string;
    component?: string;
    title: string;
    parent_id: number;
    sort: number;
    type: 'menu' | 'directory' | 'path' | 'api';
  }) => {
    return request.post('/admin/permission/menus', data);
  },

  /**
   * 更新菜单
   * PUT /admin/permission/menus/:id
   */
  updateMenu: (id: string, data: any) => {
    return request.put(`/admin/permission/menus/${id}`, data);
  },

  /**
   * 删除菜单
   * DELETE /admin/permission/menus/:id
   */
  deleteMenu: (id: string) => {
    return request.delete(`/admin/permission/menus/${id}`);
  }
};

export default permissionApi;
