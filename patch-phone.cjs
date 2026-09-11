const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /<input\s+type="text"\s+name="phone"/g,
    '<input\n                  type="tel" pattern="^\\\\+?[0-9\\\\s\\\\-\\\\(\\\\)]{7,15}$" title="Please enter a valid phone number"\n                  name="phone"'
  );
  fs.writeFileSync(file, code);
}

patchFile('src/features/properties/NewPropertyPage.tsx');
patchFile('src/features/properties/PropertyDetailPage.tsx');
