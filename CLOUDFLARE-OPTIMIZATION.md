# Cloudflare 优化配置指南

本文档将帮助你配置 Cloudflare 的免费功能来优化网站性能和安全。

## 🚀 快速优化 (免费版可用)

### 1. 自动压缩 (Auto Minify)

在 Cloudflare Dashboard 中:
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的网站
3. 导航到 **性能** > **优化**
4. 开启 **Auto Minify**:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

**效果**: 减少文件大小 30-70%

---

### 2. Brotli 压缩 (比 Gzip 更好)

1. 导航到 **性能** > **优化**
2. 开启 **Brotli**

**效果**: 比 Gzip 压缩率高 15-25%

---

### 3. 页面规则 (Page Rules)

在 Cloudflare Dashboard 中:
1. 导航到 **网站** > **页面规则**
2. 创建以下规则:

#### 规则 1: 静态资源缓存
```
URL: *zxqconsulting.com/*.css
规则:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 week
```

```
URL: *zxqconsulting.com/*.js
规则:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 week
```

```
URL: *zxqconsulting.com/*.jpg
URL: *zxqconsulting.com/*.png
URL: *zxqconsulting.com/*.svg
规则:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Origin Cache Control: On
```

#### 规则 2: 全站优化
```
URL: *zxqconsulting.com/*
规则:
- Auto Minify: JavaScript, CSS, HTML
- Brotli: On
- Early Hints: On
```

---

### 4. Speed 应用 (免费版)

导航到 **Speed** > **Speed 应用**:
- ✅ **Auto-Refresh**: 定期检查并更新缓存资源
- ✅ **Early Hints**: 预加载关键资源，减少等待时间

---

### 5. 移动端优化

在 **性能** > **优化** 中:
- ✅ **Mirage**: 移动端图片懒加载和优化
- ✅ **Polish**: 自动图片优化 (WebP/AVIF)

---

## 🛡️ 安全设置 (免费版)

### 1. DDoS 防护
- 免费版自动提供 L3/L4 DDoS 防护
- 建议保持默认设置

### 2. Web 应用防火墙 (WAF)

在 **安全** > **WAF** 中:
- 创建自定义规则阻止恶意请求
- 使用 Cloudflare 托管规则

### 3. SSL/TLS

在 **SSL/TLS** > **概述** 中:
- 推荐使用 **完全 (严格)** 模式
- 开启 **自动 HTTPS 重写**

---

## 📱 移动端优化建议

除了 Cloudflare 配置，还建议:

1. **响应式设计**: 确保网站适配各种屏幕尺寸 ✅ (已完成)
2. **图片优化**: 使用 WebP/AVIF 格式
3. **减少重定向**: 减少页面跳转
4. **触摸优化**: 确保按钮足够大 (44px+)

---

## 📊 性能监控

### Cloudflare Analytics

在 **分析** 标签中查看:
- **流量**: 访问量、带宽
- **缓存**: 命中率、存储
- **安全**: 阻止的威胁

### Speed Insights

使用 [PageSpeed Insights](https://pagespeed.web.dev/) 测试:
- 桌面端性能
- 移动端性能
- Core Web Vitals

---

## ⚡ 进阶优化 (付费版)

如果需要更多功能，可以考虑:

1. **Workers**: 自定义边缘计算
2. **Stream**: 视频托管和流媒体
3. **R2**: 无出口费用的对象存储
4. **Images**: 自动图片转换和优化
5. **Analytics**: 更详细的分析

---

## ✅ 检查清单

- [ ] 开启 Auto Minify (JS, CSS, HTML)
- [ ] 开启 Brotli 压缩
- [ ] 配置页面规则缓存静态资源
- [ ] 开启 Early Hints
- [ ] 开启 Mirage (移动端图片优化)
- [ ] 配置 SSL 为 "完全 (严格)"
- [ ] 开启自动 HTTPS 重写

---

## 📞 支持

- Cloudflare 文档: https://developers.cloudflare.com/
- 社区论坛: https://community.cloudflare.com/
- 状态页面: https://www.cloudflarestatus.com/
