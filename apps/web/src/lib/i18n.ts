// ─── i18n: lightweight translation system ─────────────────────────────────────

export type Locale = 'zh' | 'en';

const translations: Record<string, Record<Locale, string>> = {
  // Sidebar
  'nav.chat': { zh: 'AI 问答', en: 'AI Chat' },
  'nav.chemistry': { zh: '化学知识', en: 'Chemistry' },
  'nav.training': { zh: '专题训练', en: 'Training' },
  'nav.exam': { zh: '模拟考试', en: 'Mock Exam' },
  'nav.studyPlan': { zh: '学习计划', en: 'Study Plan' },
  'nav.favorites': { zh: '收藏本', en: 'Favorites' },
  'nav.settings': { zh: '设置', en: 'Settings' },
  'nav.about': { zh: '关于', en: 'About' },
  'nav.membership': { zh: '会员', en: 'VIP' },
  'nav.logout': { zh: '退出', en: 'Logout' },

  // Settings page
  'settings.title': { zh: '设置', en: 'Settings' },
  'settings.profile': { zh: '个人资料', en: 'Profile' },
  'settings.email': { zh: '邮箱', en: 'Email' },
  'settings.nickname': { zh: '昵称', en: 'Nickname' },
  'settings.defaultRole': { zh: '默认 AI 角色', en: 'Default AI Role' },
  'settings.saveProfile': { zh: '保存资料', en: 'Save Profile' },
  'settings.profileSaved': { zh: '个人资料已更新', en: 'Profile updated' },
  'settings.changePassword': { zh: '修改密码', en: 'Change Password' },
  'settings.oldPassword': { zh: '旧密码', en: 'Current Password' },
  'settings.newPassword': { zh: '新密码（至少 8 位）', en: 'New Password (min 8 chars)' },
  'settings.changePasswordBtn': { zh: '修改密码', en: 'Change Password' },
  'settings.passwordChanged': { zh: '密码已修改', en: 'Password changed' },
  'settings.appearance': { zh: '外观', en: 'Appearance' },
  'settings.darkMode': { zh: '暗色模式', en: 'Dark Mode' },
  'settings.darkModeDesc': { zh: '切换深色/浅色主题', en: 'Toggle dark/light theme' },
  'settings.language': { zh: '语言', en: 'Language' },
  'settings.languageTitle': { zh: '语言设置', en: 'Language' },
  'settings.languageDesc': { zh: '切换界面显示语言', en: 'Switch display language' },

  // Common
  'common.login': { zh: '登录', en: 'Login' },
  'common.register': { zh: '注册', en: 'Register' },
  'common.updateFailed': { zh: '更新失败', en: 'Update failed' },
  'common.changeFailed': { zh: '修改失败', en: 'Change failed' },
};

let currentLocale: Locale = 'zh';

export function setI18nLocale(locale: Locale) {
  currentLocale = locale;
}

export function getI18nLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLocale] ?? entry.zh ?? key;
}
