/**
 * 出海攻略文章自动抓取脚本
 * 
 * 使用方法:
 * 1. 先运行 npm install axios turndown
 * 2. 运行 node scripts/fetch-articles.js
 * 
 * 每天早上运行一次即可自动更新文章
 */

const fs = require('fs');
const path = require('path');

// 出海企业老板关心的主题
const TOPICS = [
  { keyword: '日本公司注册流程 2026', category: '日本', categoryEn: 'Japan' },
  { keyword: '欧盟CE认证最新政策', category: '欧洲', categoryEn: 'Europe' },
  { keyword: '东南亚投资环境 2026', category: '东南亚', categoryEn: 'Southeast Asia' },
  { keyword: '海外公司税务筹划', category: '税务', categoryEn: 'Tax' },
  { keyword: '中医药出口日本市场', category: '中医', categoryEn: 'TCM' },
  { keyword: '海外公司合规运营', category: '合规', categoryEn: 'Compliance' },
];

// 文章模板
const generateArticleTemplate = (topic, searchResults) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  return {
    id: Date.now().toString(),
    title: searchResults.title || `${topic.keyword} 完整指南`,
    titleEn: searchResults.titleEn || `Complete Guide to ${topic.keyword}`,
    excerpt: searchResults.excerpt || `深入分析${topic.keyword}的最新动态和实操指南...`,
    excerptEn: searchResults.excerptEn || `In-depth analysis of ${topic.keyword} with practical strategies...`,
    category: topic.category,
    categoryEn: topic.categoryEn,
    date: dateStr,
    tags: [topic.category, '出海', '自动更新'],
  };
};

// 主函数 - 生成建议添加的文章列表
const generateSuggestedArticles = () => {
  console.log('📰 出海攻略文章抓取工具');
  console.log('='.repeat(50));
  console.log('\n🔍 建议添加的文章主题:\n');
  
  const suggestions = TOPICS.map((topic, index) => {
    const article = generateArticleTemplate(topic, {});
    console.log(`${index + 1}. [${topic.category}] ${article.title}`);
    console.log(`   日期: ${article.date}`);
    console.log(`   标签: ${article.tags.join(', ')}\n`);
    return article;
  });
  
  console.log('='.repeat(50));
  console.log('\n💡 使用说明:');
  console.log('1. 每天运行此脚本获取最新主题');
  console.log('2. 根据搜索结果编写详细文章内容');
  console.log('3. 将文章添加到 articles.json');
  
  return suggestions;
};

// 生成 articles.json 格式的输出
const generateJsonOutput = () => {
  const suggestions = generateSuggestedArticles();
  
  const output = {
    articles: suggestions,
    lastUpdated: new Date().toISOString().split('T')[0],
    note: '此为自动生成的基础模板，请补充详细内容后使用'
  };
  
  const outputPath = path.join(__dirname, '../public/suggested-articles.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ 已生成建议文章: ${outputPath}`);
};

// 交互式选择主题
const interactiveMode = async () => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n📋 请选择要搜索的主题:\n');
  TOPICS.forEach((topic, index) => {
    console.log(`  ${index + 1}. ${topic.keyword} [${topic.category}]`);
  });
  
  readline.question('\n请输入序号 (多个用逗号分隔): ', (answer) => {
    const indices = answer.split(',').map(s => parseInt(s.trim()) - 1).filter(i => !isNaN(i));
    
    console.log('\n🔍 您选择的主题:\n');
    indices.forEach(i => {
      if (TOPICS[i]) {
        console.log(`  • ${TOPICS[i].keyword}`);
      }
    });
    
    readline.close();
  });
};

// 根据参数运行
const args = process.argv.slice(2);
if (args.includes('--interactive')) {
  interactiveMode();
} else if (args.includes('--generate')) {
  generateJsonOutput();
} else {
  generateSuggestedArticles();
}

module.exports = { generateSuggestedArticles, TOPICS };
