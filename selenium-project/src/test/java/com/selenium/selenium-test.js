const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function exampleTest() {
  const service = new chrome.ServiceBuilder('/usr/lib/chromium-browser/chromedriver').build();
  chrome.setDefaultService(service);

  const driver = new Builder().forBrowser('chrome').build();

  try {
    await driver.get('https://www.google.com');
    const searchBox = await driver.findElement(By.name('q'));
    await searchBox.sendKeys('Selenium', Key.RETURN);
    await driver.wait(until.titleIs('Selenium - Google Search'), 1000);
  } finally {
    await driver.quit();
  }
}

exampleTest();

