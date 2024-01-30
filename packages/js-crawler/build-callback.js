const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const md5 = require('md5')

const distPath = path.join(__dirname, './dist');
const filePath = path.join(distPath, 'index.umd.min.js')
console.log(distPath, filePath)
const isTrue = fs.statSync(filePath);
if (isTrue) {
  const code = fs.readFileSync(filePath)
  const config = require('./src/config.json')
  const codeString = `
    export const host = "${config.host}";
    export const codeString = decodeURIComponent("${encodeURIComponent(`function(callback) {${code} ${`__${md5(`${pkg.name}_${pkg.version}`)}__`}(callback)}`)}");
    export default codeString;
  `.trim().trimEnd()
  fs.writeFileSync(path.join(distPath, 'index.umd.string.js'), codeString);
  fs.writeFileSync(path.join(distPath, '../../../src/utils/', 'js-crawler.ts'), codeString);
}
