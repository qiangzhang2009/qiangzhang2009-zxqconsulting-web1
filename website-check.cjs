const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  try {
    console.log('Navigating to website...');
    await page.goto('https://zxqconsulting-web1-pg3heoi62-johnzhangs-projects-50e83ec4.vercel.app', { waitUntil: 'networkidle', timeout: 60000 });
    
    console.log('Page loaded, taking screenshot of initial view...');
    await page.screenshot({ path: 'website-check/screenshot-1-hero.png', fullPage: false });
    
    // Get page height for scrolling
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Page height: ${pageHeight}px`);
    
    // Scroll through and take screenshots of each section
    let scrollPosition = 0;
    let sectionCount = 1;
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    
    while (scrollPosition < pageHeight) {
      await page.evaluate(pos => window.scrollTo(0, pos), scrollPosition);
      await page.waitForTimeout(500); // Wait for content to render
      
      const screenshotName = `website-check/screenshot-${sectionCount}-scroll.png`;
      await page.screenshot({ path: screenshotName, fullPage: false });
      console.log(`Took screenshot at position ${scrollPosition}: ${screenshotName}`);
      
      scrollPosition += viewportHeight - 100; // Overlap slightly
      sectionCount++;
    }
    
    // Also take full page screenshot
    console.log('Taking full page screenshot...');
    await page.screenshot({ path: 'website-check/screenshot-fullpage.png', fullPage: true });
    
    // Check for blank/empty content areas
    console.log('\n--- Checking for potential issues ---');
    
    // Check for empty elements
    const emptyElements = await page.evaluate(() => {
      const issues = [];
      
      // Check for empty divs that might be content placeholders
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach((div, index) => {
        if (div.clientHeight > 100 && div.clientWidth > 100 && div.innerText.trim() === '' && !div.querySelector('img') && !div.querySelector('svg')) {
          issues.push(`Empty large div at index ${index}: ${div.className}`);
        }
      });
      
      return issues;
    });
    
    if (emptyElements.length > 0) {
      console.log('Empty elements found:', emptyElements.slice(0, 5));
    }
    
    // Get all headings to verify content
    const headings = await page.evaluate(() => {
      const h1 = Array.from(document.querySelectorAll('h1')).map(h => h.innerText);
      const h2 = Array.from(document.querySelectorAll('h2')).map(h => h.innerText);
      const h3 = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
      return { h1, h2, h3 };
    });
    
    console.log('\n--- Headings found ---');
    console.log('H1:', headings.h1);
    console.log('H2:', headings.h2.slice(0, 10));
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements.filter(img => !img.complete || img.naturalWidth === 0).map(img => ({
        src: img.src,
        alt: img.alt
      }));
    });
    
    console.log('\n--- Broken images (not loaded) ---');
    console.log(brokenImages);
    
    // Report console errors
    console.log('\n--- Console Errors ---');
    if (consoleErrors.length > 0) {
      console.log('Errors found:');
      consoleErrors.forEach(err => console.log('- ' + err));
    } else {
      console.log('No console errors found!');
    }
    
    console.log('\n--- Summary ---');
    console.log('Screenshots saved to website-check/ folder');
    console.log('Total sections captured:', sectionCount);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
