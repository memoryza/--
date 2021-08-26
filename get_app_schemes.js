const getMacApps = require("get-mac-apps");
const parser = require('plist');
const fs = require('fs');
const path = require('path');

getMacApps
  .getApps()
  .then(apps => {
    const presudoList = apps.map((app, index) => {
      const appConfigPath = path.join(app.path, 'Contents/info.plist');
      let schemes = [];
      if (fs.existsSync(appConfigPath)) {
        try {
        	const fileContent = fs.readFileSync(appConfigPath, {encoding: 'utf-8'});
          const pXml = parser.parse(fileContent);
          if (pXml.CFBundleURLTypes) {
            pXml.CFBundleURLTypes.forEach(scheme => {
              if (scheme.CFBundleURLSchemes) {
                schemes = [...schemes, ...scheme.CFBundleURLSchemes]
              }
            });
          }
        } catch (e) {
          console.log(app._name)
        }
      }
      return {
        schemes,
        name: app._name,
      }
    }).filter(app => app.schemes.length);
    fs.writeFileSync(path.join(__dirname, './src/appSchemes.js'), `export const sList = ${JSON.stringify(presudoList)}`);

  })
  .catch(error => console.log(error.message));
