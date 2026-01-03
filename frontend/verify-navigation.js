/**
 * Navigation Verification Script
 * 验证前端导航功能是否正常工作
 */

const puppeteer = require("puppeteer");

async function verifyNavigation() {
  console.log("🚀 开始验证导航功能...");

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false, // 显示浏览器窗口以便观察
      defaultViewport: { width: 1200, height: 800 },
    });

    const page = await browser.newPage();

    // 启用控制台日志
    page.on("console", (msg) => {
      console.log(`[浏览器] ${msg.text()}`);
    });

    // 监听页面错误
    page.on("pageerror", (error) => {
      console.error(`[页面错误] ${error.message}`);
    });

    console.log("📱 正在加载主页面...");
    await page.goto("http://localhost:5173", { waitUntil: "networkidle0" });

    // 等待页面加载完成
    await page.waitForTimeout(2000);

    console.log("🔍 检查页面元素...");

    // 检查紧急求助按钮是否存在
    const emergencyButton = await page.$('button:has-text("紧急求助")');
    if (!emergencyButton) {
      console.error("❌ 未找到紧急求助按钮");
      return false;
    }

    console.log("✅ 找到紧急求助按钮");

    // 点击紧急求助按钮
    console.log("🖱️ 点击紧急求助按钮...");
    await emergencyButton.click();

    // 等待导航完成
    await page.waitForTimeout(1000);

    // 检查URL是否变化
    const currentUrl = page.url();
    console.log(`📍 当前URL: ${currentUrl}`);

    if (currentUrl.includes("/emergency")) {
      console.log("✅ 导航成功！URL已更改为紧急页面");

      // 检查紧急页面内容是否加载
      const emergencyPageTitle = await page.$('h1:has-text("紧急操作中心")');
      if (emergencyPageTitle) {
        console.log("✅ 紧急页面内容已正确加载");
        return true;
      } else {
        console.log("⚠️ 紧急页面URL正确但内容未加载");
        return false;
      }
    } else {
      console.log("❌ 导航失败！URL未发生变化");
      return false;
    }
  } catch (error) {
    console.error(`❌ 验证过程中发生错误: ${error.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  verifyNavigation().then((success) => {
    if (success) {
      console.log("🎉 导航功能验证成功！");
      process.exit(0);
    } else {
      console.log("💥 导航功能验证失败！");
      process.exit(1);
    }
  });
}

module.exports = { verifyNavigation };
