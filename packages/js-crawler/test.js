const puppeteer = require('puppeteer');

(async () => {
    const pkg = require('./package.json')
    const config = require('./src/config.json')
    const md5 = require('md5')
    const fs = require('fs')
    const path = require('path')
    const code = fs.readFileSync(path.join(__dirname, './dist/index.umd.js'))
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();
    await page.goto(config.host);
    await page.evaluate(`${code}`)
    setTimeout(async () => {
        const dd = await page.evaluate(`
        ${code}
        ${`__${md5(`${pkg.name}_${pkg.version}`)}__`}()
        `)
        console.log(dd)
        browser.close();
    }, 1000)
})();
