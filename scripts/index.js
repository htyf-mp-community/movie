const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const pkg = require('../package.json')
const appConfig = require('../project.dgz.json')

QRCode.toFile(path.join(__dirname, '../public/qrcode.png'), JSON.stringify(appConfig), {
    margin: 1,
    width: 256,
    color: {
        dark: '#000000FF',
        light: '#FFFFFFFF'
    }
}, function (err) {
    if (err) throw err;
    console.log('QR code saved!');
});