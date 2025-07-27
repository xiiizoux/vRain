import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/books',
    children: [
      {
        path: '/books',
        name: 'Books',
        component: () => import('@/views/Books/index.vue'),
        meta: {
          title: '书籍管理',
          icon: 'Collection'
        }
      },
      {
        path: '/books/:id',
        name: 'BookDetail',
        component: () => import('@/views/Books/Detail.vue'),
        meta: {
          title: '书籍详情',
          hidden: true
        }
      },
      {
        path: '/books/:id/config',
        name: 'BookConfig',
        component: () => import('@/views/Books/Config.vue'),
        meta: {
          title: '书籍配置',
          hidden: true
        }
      },
      {
        path: '/books/:id/files',
        name: 'BookFiles',
        component: () => import('@/views/Books/Files.vue'),
        meta: {
          title: '文件管理',
          hidden: true
        }
      },
      {
        path: '/canvas',
        name: 'Canvas',
        component: () => import('@/views/Canvas/index.vue'),
        meta: {
          title: '背景图管理',
          icon: 'Picture'
        }
      },
      {
        path: '/canvas/:id',
        name: 'CanvasDetail',
        component: () => import('@/views/Canvas/Detail.vue'),
        meta: {
          title: '背景图详情',
          hidden: true
        }
      },
      {
        path: '/generate',
        name: 'Generate',
        component: () => import('@/views/Generate/index.vue'),
        meta: {
          title: '生成管理',
          icon: 'DocumentAdd'
        }
      },
      {
        path: '/tools',
        name: 'Tools',
        component: () => import('@/views/Tools/index.vue'),
        meta: {
          title: '工具集',
          icon: 'Tools'
        }
      },
      {
        path: '/logs',
        name: 'Logs',
        component: () => import('@/views/Logs/index.vue'),
        meta: {
          title: '日志查看',
          icon: 'Document'
        }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue'),
        meta: {
          title: '系统设置',
          icon: 'Setting'
        }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/Error/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - vRain WebUI`
  }
  next()
})

export default router
