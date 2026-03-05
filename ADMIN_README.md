# 智信企管咨询 - 数据后台

## 访问地址
**https://www.zxqconsulting.com/admin**

## 登录凭证
- **API Key**: `zxq_admin_secret_key_2024`

## 功能说明

### 1. 仪表盘 (Dashboard)
- 今日/本周关键指标
- 访客趋势图
- 最近表单提交

### 2. 客户管理 (Visitors)
- 所有访客列表
- 查看详细信息
- 按日期/关键词搜索

### 3. 表单提交 (Submissions)
- 联系表单列表
- 标记处理状态
- 添加备注

### 4. 数据导出 (Export)
- 导出CSV格式
- 按时间范围筛选

## API 接口

```
# 获取统计数据
GET /api/admin/analytics?website_id=zxqconsulting&days=30
Authorization: Bearer zxq_admin_secret_key_2024

# 获取访客列表  
GET /api/admin/visitors?page=1&limit=20&search=&website_id=zxqconsulting
Authorization: Bearer zxq_admin_secret_key_2024

# 获取表单提交
GET /api/admin/submissions?page=1&limit=20&status=&website_id=zxqconsulting
Authorization: Bearer zxq_admin_secret_key_2024

# 更新表单状态
PATCH /api/admin/submissions/:id
Authorization: Bearer zxq_admin_secret_key_2024
Body: { "status": "contacted", "notes": "已电话联系" }
```

## 数据表结构

### websites - 网站配置
| 字段 | 说明 |
|------|------|
| website_id | 唯一标识 |
| name | 网站名称 |
| domain | 域名 |

### visitors - 访客信息
| 字段 | 说明 |
|------|------|
| visitor_id | 访客唯一ID |
| company_name | 公司名称 |
| contact_name | 联系人 |
| contact_phone | 电话 |
| product_category | 产品类型 |
| target_region | 目标区域 |
| readiness_score | 准备度得分 |
| country | 国家 |
| device_type | 设备类型 |

### submissions - 表单提交
| 字段 | 说明 |
|------|------|
| name | 姓名 |
| phone | 电话 |
| email | 邮箱 |
| company | 公司 |
| message | 留言 |
| status | 状态(new/contacted/closed) |
| created_at | 提交时间 |

### behaviors - 行为记录
| 字段 | 说明 |
|------|------|
| event_type | 事件类型 |
| event_category | 事件分类 |
| page_url | 页面URL |
| duration_seconds | 停留时长 |
| created_at | 时间 |
