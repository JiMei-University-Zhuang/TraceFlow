import puppeteer from 'puppeteer';

(async () => {
  // 浏览器配置
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });

  try {
    const page = await browser.newPage();

    // 监听浏览器控制台输出
    page.on('console', msg => {
      console.log(`[BROWSER LOG] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    // 配置页面
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setDefaultNavigationTimeout(30000);

    // 导航到测试页面
    await page.goto('https://saucedemo.com', {
      waitUntil: 'networkidle2',
    });
    // -------------------------------
    console.log('测试输出ing...  this is zst');
    // -------------------------------
    await page.screenshot({ path: 'screenshot.png' });
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await browser.close();
  }
})();
