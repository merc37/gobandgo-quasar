const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/map',
    children: [
      { path: '/map', component: () => import('pages/MapPage.vue') },
      { path: '/signup', component: () => import('pages/SignUpPage.vue') },
      { path: '/edit', component: () => import('pages/EditPage.vue') },
      { path: '/admin', component: () => import('pages/AdminPage.vue') },
    ]
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  });
}

export default routes;
