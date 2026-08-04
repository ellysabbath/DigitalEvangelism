// src/api/endpoints.ts
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verify: '/auth/verify',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    profile: '/users/profile',
    update: '/users/update',
    list: '/users/list',
  },
  groups: {
    list: '/groups',
    create: '/groups/create',
    detail: (id: string) => `/groups/${id}`,
    update: (id: string) => `/groups/${id}`,
    delete: (id: string) => `/groups/${id}`,
    addEvangelist: (id: string) => `/groups/${id}/add-evangelist`,
    addStudent: (id: string) => `/groups/${id}/add-student`,
  },
  sermons: {
    list: '/sermons',
    create: '/sermons/create',
    detail: (id: string) => `/sermons/${id}`,
    update: (id: string) => `/sermons/${id}`,
    delete: (id: string) => `/sermons/${id}`,
    publish: (id: string) => `/sermons/${id}/publish`,
    share: (id: string) => `/sermons/${id}/share`,
  },
  questions: {
    create: '/questions/create',
    update: (id: string) => `/questions/${id}`,
    delete: (id: string) => `/questions/${id}`,
  },
  exams: {
    submit: '/exams/submit',
    list: '/exams',
    detail: (id: string) => `/exams/${id}`,
    grade: (id: string) => `/exams/${id}/grade`,
    results: '/exams/results',
  },
  certificates: {
    generate: '/certificates/generate',
    list: '/certificates',
    detail: (id: string) => `/certificates/${id}`,
    verify: (code: string) => `/certificates/verify/${code}`,
  },
  comments: {
    list: (sermonId: string) => `/sermons/${sermonId}/comments`,
    create: (sermonId: string) => `/sermons/${sermonId}/comments`,
    delete: (id: string) => `/comments/${id}`,
  },
} as const;