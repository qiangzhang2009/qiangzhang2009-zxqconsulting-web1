const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to standard size
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log('Navigating to website...');
  await page.goto('https://zxqconsulting-web1-pg3heoi62-johnzhangs-projects-50e83ec4.vercel.app', { waitUntil: 'networkidle' });
  
  // Take initial screenshot
  await page.screenshot({ path: 'screenshot-1-initial.png', fullPage: false });
  console.log('Screenshot 1: Initial viewport');
  
  // Get page content for analysis
  const html = await page.content();
  
  // Check for empty elements
  const emptyDivs = await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'));
    const empty = allDivs.filter(div => {
      if (div.children.length === 0 && div.textContent.trim() === '') {
        // Only count if it's reasonably sized (not tiny)
        const rect = div.getBoundingClientRect();
        return rect.width > 50 && rect.height > 50;
      }
      return false;
    });
    return empty.length;
  });
  
  console.log('Empty large divs found:', emptyDivs);
  
  // Check for images with issues
  const imageIssues = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const broken = imgs.filter(img => {
      return img.naturalWidth === 0 || img.complete === false;
    });
    return {
      total: imgs.length,
      broken: broken.length,
      brokenSrc: broken.map(img => img.src)
    };
  });
  
  console.log('Image issues:', JSON.stringify(imageIssues, null, 2));
  
  // Scroll and take more screenshots
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  
  console.log('Page scroll height:', scrollHeight);
  console.log('Viewport height:', viewportHeight);
  
  // Scroll to bottom in increments
  let screenshots = 1;
  let scrollPosition = 0;
  
  while (scrollPosition < scrollHeight - viewportHeight) {
    scrollPosition += viewportHeight;
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition);
    await page.waitForTimeout(500); // Wait for any lazy-loaded content
    
    screenshots++;
    await page.screenshot({ path: `screenshot-${screenshots}-scroll.png`, fullPage: false });
    console.log(`Screenshot ${screenscreens}: Scroll position ${scrollPosition}`);
  }
  
  // Final full page screenshot
  await page.screenshot({ path: 'screenshot-fullpage.png', fullPage: true });
  console.log('Full page screenshot saved');
  
  // Get text content analysis
  const textAnalysis = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, div[class*="section"]'));
    return sections.map((section, i) => {
      const text = section.textContent.trim();
      return {
        index: i,
        className: section.className,
        textLength: text.length,
        hasContent: text.length > 0
      };
    });
  });
  
  console.log('Section analysis:', JSON.stringify(textAnalysis.slice(0, 20), null, 2));
  
  // Check for any visible console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await browser.close();
  
  console.log('\n--- SUMMARY ---');
  console.log('Total screenshots taken:', screenshots);
  console.log('Empty large divs:', emptyDivs);
  console.log('Total images:', imageIssues.total);
  console.log('Broken images:', imageIssues.broken);
})();
