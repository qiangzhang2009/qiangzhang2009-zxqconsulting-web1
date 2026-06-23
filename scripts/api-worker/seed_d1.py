#!/usr/bin/env python3
"""Seed additional high-quality Q&A into D1 with AI replies."""
import json
import subprocess
import time
import random

# 24 high-quality Q&As covering diverse global TCM export topics
SEED_DATA = [
    # CN - Legal
    {"name": "林厂长", "q": "我们是一家广东的中药饮片厂，想把黄芪、党参等品种出口到日本市场，请问需要哪些认证？", "country": "CN", "region": "广东", "city": "广州", "lang": "zh", "agent": "legal", "likes": 45},
    {"name": "王博士", "q": "请问保健食品出口到美国需要什么资质？我们的产品主要含有灵芝和虫草提取物。", "country": "CN", "region": "上海", "city": "上海", "lang": "zh", "agent": "legal", "likes": 52},
    {"name": "李医师", "q": "我们的中药配方颗粒在日本申请的一般用医药品认证被拒了，审查意见说临床数据不足。请问有什么补救方案？", "country": "CN", "region": "北京", "city": "北京", "lang": "zh", "agent": "legal", "likes": 38},
    {"name": "崔经理", "q": "中医药品出口到韩国需要做哪些检测？KFDA认证的大概周期和费用是多少？", "country": "CN", "region": "吉林", "city": "长春", "lang": "zh", "agent": "finance", "likes": 31},
    {"name": "张老板", "q": "我们是四川的一家火锅底料和中药材出口商，想把当归、枸杞子出口到北美华人超市，请问FDA和海关的流程是怎样的？", "country": "CN", "region": "四川", "city": "成都", "lang": "zh", "agent": "legal", "likes": 29},
    {"name": "周总", "q": "想咨询一下，中药产品出口到欧盟，如果走传统食品补充剂路线，大概需要多少时间和费用？和药品注册路线相比哪个更划算？", "country": "CN", "region": "江苏", "city": "苏州", "lang": "zh", "agent": "finance", "likes": 44},
    {"name": "王工", "q": "请问中医药出口包装有什么特殊要求？目标市场对中药包装的标签和说明书有什么规定？", "country": "CN", "region": "安徽", "city": "亳州", "lang": "zh", "agent": "logistics", "likes": 22},
    {"name": "陈总", "q": "我们是海南的热带植物提取物出口商，想把石斛、沉香提取物出口到法国和意大利，有什么特殊的植物药规定吗？", "country": "CN", "region": "海南", "city": "海口", "lang": "zh", "agent": "legal", "likes": 27},
    {"name": "刘总", "q": "请问中医药出口跨境电商平台（如亚马逊全球开店、TikTok Shop）有哪些合规要点需要特别注意？", "country": "CN", "region": "浙江", "city": "杭州", "lang": "zh", "agent": "consultant", "likes": 61},
    {"name": "李厂长", "q": "我们是做中药保健酒的工厂，想出口到东南亚和澳大利亚，酒类出口和普通食品出口的法规有什么不同？", "country": "CN", "region": "四川", "city": "泸州", "lang": "zh", "agent": "legal", "likes": 19},

    # International
    {"name": "Michael Chen", "q": "We are an American importer looking to bring high quality TCM herbal supplements into the US market. What FDA compliance steps do we need for products containing ginseng and reishi?", "country": "US", "region": "California", "city": "Los Angeles", "lang": "en", "agent": "consultant", "likes": 48},
    {"name": "Dr. Sarah Wu", "q": "We want to import Chinese patent medicines for a chain of TCM clinics in the US. What import permits and FDA registrations are required?", "country": "US", "region": "New York", "city": "New York", "lang": "en", "agent": "legal", "likes": 55},
    {"name": "Ricardo Santos", "q": "We are a Brazilian import company interested in distributing Chinese herbal teas and TCM supplements in São Paulo. What ANVISA regulations and import documentation are required?", "country": "BR", "region": "São Paulo", "city": "São Paulo", "lang": "en", "agent": "legal", "likes": 23},
    {"name": "Hans Mueller", "q": "Wir importieren chinesische Kräuterextrakte für Nahrungsergänzungsmittel nach Deutschland. Was sind die aktuellen EU-Novel-Food-Bestimmungen für Produkte mit Ginseng und Goji?", "country": "DE", "region": "Bayern", "city": "München", "lang": "en", "agent": "consultant", "likes": 34},
    {"name": "Emma Thompson", "q": "We want to import TCM herbal products into Australia for health food stores. What TGA requirements apply to listed medicines with Chinese herbal ingredients?", "country": "AU", "region": "New South Wales", "city": "Sydney", "lang": "en", "agent": "consultant", "likes": 41},
    {"name": "Lim Wei Jie", "q": "We are a Malaysian company looking to distribute TCM health supplements. What are the NPCB regulations and import procedures for Chinese herbal products?", "country": "MY", "region": "Selangor", "city": "Shah Alam", "lang": "en", "agent": "consultant", "likes": 37},
    {"name": "Ahmed Al-Rashid", "q": "We are a UAE-based pharmaceutical distributor exploring TCM/health supplements for the GCC market. What regulatory requirements apply in the UAE and Saudi Arabia?", "country": "AE", "region": "Dubai", "city": "Dubai", "lang": "en", "agent": "legal", "likes": 29},
    {"name": "Dr. Wei Zhang", "q": "We are a UK-based TCM clinic chain looking to import Chinese patent medicines and granular extracts. What MHRA licensing, import declaration and VAT implications apply?", "country": "GB", "region": "England", "city": "London", "lang": "en", "agent": "legal", "likes": 43},
    {"name": "Niran Kittisak", "q": "We are a Thai distributor looking to import Chinese TCM herbal products for modern clinic chains in Bangkok and Chiang Mai. What Thai FDA (TFDA) product registration and labeling requirements apply?", "country": "TH", "region": "Bangkok", "city": "Bangkok", "lang": "en", "agent": "legal", "likes": 18},
    {"name": "Budi Santoso", "q": "We are an Indonesian distributor exploring distribution rights for TCM health supplements in Jakarta and Bali. What BPOM registration process and timelines should we expect?", "country": "ID", "region": "DKI Jakarta", "city": "Jakarta", "lang": "en", "agent": "consultant", "likes": 25},
    {"name": "田中太郎", "q": "中国から健康食品チェーンに漢方を輸入したいですが、必要な規制手続きを教えてください。", "country": "JP", "region": "東京都", "city": "東京", "lang": "zh", "agent": "consultant", "likes": 39},
    {"name": "李经理", "q": "中药提取物出口物流走海运好还是空运好？考虑到活性成分稳定性问题。", "country": "CN", "region": "山东", "city": "济南", "lang": "zh", "agent": "logistics", "likes": 33},
    {"name": "陈财务", "q": "请问中医药出口的关税政策如何？特别是出口到RCEP成员国的税率优惠有哪些？", "country": "CN", "region": "浙江", "city": "杭州", "lang": "zh", "agent": "finance", "likes": 58},
    {"name": "刘经理", "q": "我们想把中药配方颗粒出口到东南亚，特别是新加坡和马来西亚，华人市场为主。", "country": "CN", "region": "四川", "city": "成都", "lang": "zh", "agent": "consultant", "likes": 36},
]

AGENT_REPLIES = {
    "consultant": {
        "zh": "您好！感谢您的提问。以下是针对您问题的专业分析和建议：\n\n一、市场进入策略：建议先从准入门槛较低的市场切入，积累经验和合规数据后再拓展至一线市场。\n\n二、渠道选择：线上电商平台（如亚马逊、TikTok Shop）和线下华人渠道（如中药店、保健品专卖店）是两个主要路径，各有利弊。\n\n三、成本预算：不同市场准入成本差异较大，建议预留总预算的20-30%作为合规和认证费用。\n\n四、时间规划：东南亚市场通常3-6个月，欧美市场需要12-24个月。建议制定分阶段进入计划。\n\n如需进一步制定详细市场进入方案，欢迎使用岐黄四海的AI诊断工具，获取针对性的分析和报价。",
        "en": "Great question! Here's our professional analysis:\n\n1. Market Entry Strategy: We recommend starting with lower-barrier markets to build compliance track record before entering Tier 1 markets.\n\n2. Channel Selection: Online platforms (Amazon, TikTok Shop) and offline Chinese community channels are the two main paths, each with trade-offs.\n\n3. Budget Planning: Entry costs vary significantly by market — plan 20-30% of total budget for compliance and certification.\n\n4. Timeline: Southeast Asia typically 3-6 months; EU/US requires 12-24 months. A phased approach is recommended.\n\nFor a detailed market entry plan tailored to your product, try our AI diagnosis tool."
    },
    "legal": {
        "zh": "您好！根据我们的经验，针对您的问题需要从以下几个维度进行分析：\n\n一、目标市场监管框架：不同国家对中医药产品的监管分类不同（药品、食品补充剂、医疗器械等），分类决定了你需要申请的认证类型。\n\n二、认证周期与成本：主要市场的药品注册通常需要12-36个月，食品补充剂路线通常3-12个月。建议先做目标市场的分类确认。\n\n三、文件准备：GMP证书、原产国证明、成分分析报告、标签设计是关键文件，建议提前6个月开始准备。\n\n四、常见被拒原因：临床数据不足、标签不合规、成分未在批准清单内是主要问题。建议委托专业顾问做预审。\n\n岐黄四海平台可提供针对您产品的具体市场准入分析和合规路径规划。",
        "en": "Hello! Based on our experience, your question requires analysis across several dimensions:\n\n1. Target Market Regulatory Framework: Different countries classify TCM products differently (drugs, dietary supplements, medical devices). Classification determines the certification path.\n\n2. Timeline and Cost: Drug registration in major markets typically takes 12-36 months; dietary supplement route usually 3-12 months. Confirm classification first.\n\n3. Document Preparation: GMP certificate, Certificate of Free Sale, COA, and label design are key. Start preparation 6 months in advance.\n\n4. Common Rejection Reasons: Insufficient clinical data, non-compliant labels, and unapproved ingredients are the main issues. Pre-review by a professional consultant is recommended."
    },
    "finance": {
        "zh": "您好！关于中医药出口的税务和成本问题，以下是专业分析：\n\n一、RCEP关税优惠：中日韩、东盟成员国对大多数中药材已实现低关税或零关税，但需办理RCEP原产地证书（Form R）。\n\n二、出口退税：中药材和中药提取物通常可享受13%的出口退税政策，具体退税率视产品海关编码（HS Code）而定。\n\n三、主要市场成本估算：美国FDA注册费用约3-8万美元；欧盟约2-5万欧元；日本约150-500万日元；东南亚约1-3万美元。\n\n四、隐性成本：标签本地化、包装调整、第三方检测、物流和保险通常占总成本30-40%。\n\n建议先确认产品的HS编码，再做详细的成本预算。岐黄四海平台可提供免费的成本估算服务。",
        "en": "Hello! Here's our professional analysis of tax and cost considerations:\n\n1. RCEP Tariff Benefits: Most Chinese herbs enjoy low or zero tariffs to Japan, Korea, and ASEAN members under RCEP. Form R certificate is required.\n\n2. Export VAT Rebates: Chinese herbs and extracts typically qualify for 13% export VAT rebate, depending on HS Code.\n\n3. Major Market Cost Estimates: US FDA registration ~$30-80K; EU ~20-50K EUR; Japan ~1.5-5M JPY; Southeast Asia ~$10-30K.\n\n4. Hidden Costs: Label localization, packaging adjustment, third-party testing, logistics and insurance typically account for 30-40% of total cost.\n\nWe recommend confirming your product's HS Code first, then build a detailed cost budget."
    },
    "logistics": {
        "zh": "您好！关于中药出口物流，以下是专业建议：\n\n一、海运适用：大批量货物（超过500kg）、保质期超过12个月的稳定提取物，优先选择海运。使用温控集装箱（15-25°C或2-8°C冷链）可保证品质。\n\n二、空运适用：高价值产品（单票超过5万美元）、急需样品、保质期短的活性成分，需要全程空运温控。\n\n三、清关时效：海运清关通常5-15个工作日，空运1-3个工作日。东南亚整体时效比欧美快3-5天。\n\n四、物流商选择：建议选用有中药/保健品专线经验的货代，如DHL pharma、DB Schenker、中外运等。\n\n五、保险：建议购买All Risks + War Risk货运险，特别是高价值产品。\n\n岐黄四海平台合作的专业物流服务商可为会员提供优惠报价。",
        "en": "Hello! Here's our professional logistics advice:\n\n1. Sea Freight: Best for large volumes (500kg+), stable extracts with shelf life over 12 months. Use temperature-controlled containers (15-25°C or 2-8°C cold chain).\n\n2. Air Freight: Required for high-value products (>$50K), urgent samples, and temperature-sensitive active ingredients.\n\n3. Customs Clearance: Sea freight typically 5-15 working days; air 1-3 days. Southeast Asia is 3-5 days faster than EU/US overall.\n\n4. Forwarder Selection: Choose freight forwarders with TCM/health product experience like DHL pharma, DB Schenker, or SINOTRANS.\n\n5. Insurance: Purchase All Risks + War Risk coverage, especially for high-value products."
    }
}

def uuid4():
    import random
    chars = '0123456789abcdef'
    segments = ['xxxxxxxx', 'xxxx', '4xxx', 'yxxx', 'xxxxxxxxxxxx']
    parts = []
    for seg in segments:
        for c in seg:
            if c == 'x':
                parts.append(random.choice(chars))
            elif c == 'y':
                parts.append(random.choice('89ab'))
            else:
                parts.append(c)
        parts.append('-')
    return ''.join(parts[:-1])

def escape_sql(s):
    if s is None: return ''
    return str(s).replace("'", "''").replace('\\', '\\\\')

def sql_escape_json(s):
    if s is None: return '[]'
    return json.dumps(s, ensure_ascii=False).replace("'", "''")

now = int(time.time() * 1000)
DB = "zxqconsulting-comments"
# Clear existing seed entries first
print("Clearing existing seed entries...")
subprocess.run([
    "npx", "wrangler", "d1", "execute", DB,
    "--command", "DELETE FROM comments WHERE id LIKE 'seed-%' OR id LIKE 'ai-%' OR id LIKE 'manual-%';",
], cwd="/Users/john/zxqconsulting-web1/scripts/api-worker", capture_output=True)

print(f"Seeding {len(SEED_DATA)} Q&As...")
for i, item in enumerate(SEED_DATA):
    comment_id = f"seed-{uuid4()}"
    agent = item["agent"]
    lang = item["lang"]
    reply_text = AGENT_REPLIES.get(agent, AGENT_REPLIES["consultant"]).get(lang, AGENT_REPLIES.get(agent, AGENT_REPLIES["consultant"])["zh"])

    # Spread timestamps over the past 48 hours
    minutes_ago = random.randint(30, 48 * 60)
    ts = time.time() - minutes_ago * 60
    ts_str = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime(ts))

    reply_ts = int((ts + 2 * 60) * 1000)  # 2 minutes after question

    reply = {
        "id": f"r-{uuid4()}",
        "user_name": "商务顾问" if agent == "consultant" else ("法律顾问" if agent == "legal" else ("财税顾问" if agent == "finance" else "物流顾问")),
        "user_emoji": "💼" if agent == "consultant" else ("⚖️" if agent == "legal" else ("💰" if agent == "finance" else "🚢")),
        "user_gradient": "linear-gradient(135deg, #3b82f6, #8b5cf6)" if agent == "consultant" else ("linear-gradient(135deg, #10b981, #06b6d4)" if agent == "legal" else ("linear-gradient(135deg, #f59e0b, #ef4444)" if agent == "finance" else "linear-gradient(135deg, #06b6d4, #3b82f6)")),
        "user_role": "外贸进出口 · 商务谈判 · 合作撮合" if agent == "consultant" else ("知识产权 · 合同审核 · 合规咨询" if agent == "legal" else ("进出口税务 · 外汇管理 · 成本优化" if agent == "finance" else "国际物流 · 清关报关 · 仓储配送")),
        "is_agent": True,
        "agent_id": agent,
        "content": reply_text,
        "timestamp": reply_ts,
        "is_admin": False,
        "is_system": False
    }

    replies_json = json.dumps([reply], ensure_ascii=False)

    sql = f"""INSERT INTO comments (id, user_name, user_email, content, timestamp, likes, liked_by, replies, status, geo_country, geo_region, geo_city, lang)
    VALUES ('{comment_id}', '{escape_sql(item['name'])}', '', '{escape_sql(item['q'])}', '{ts_str}', {item['likes']}, '[]', '{replies_json}', 'approved', '{item['country']}', '{escape_sql(item['region'])}', '{escape_sql(item['city'])}', '{item['lang']}')"""

    result = subprocess.run([
        "npx", "wrangler", "d1", "execute", DB,
        "--command", sql,
    ], cwd="/Users/john/zxqconsulting-web1/scripts/api-worker", capture_output=True, text=True)

    if result.returncode == 0:
        print(f"  [{i+1}/{len(SEED_DATA)}] ✓ {item['name']} ({item['country']}) - {item['q'][:30]}...")
    else:
        print(f"  [{i+1}/{len(SEED_DATA)}] ✗ Failed: {result.stderr[:100]}")

print(f"\nDone! {len(SEED_DATA)} Q&As seeded.")
