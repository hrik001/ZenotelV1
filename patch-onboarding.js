const fs = require('fs');
let code = fs.readFileSync('src/features/onboarding/OnboardingFlow.tsx', 'utf8');

// Update initial state
code = code.replace(
  "const [country, setCountry] = useState('US');",
  "const [country, setCountry] = useState('IN');\n  const [propertyState, setPropertyState] = useState('');\n  const [propertyAddress, setPropertyAddress] = useState('');"
);

// Map countries to default values
const defaultsHelper = `
const getCountryDefaults = (c: string) => {
  switch (c) {
    case 'IN': return { timezone: 'Asia/Kolkata', currency: 'INR' };
    case 'US': return { timezone: 'America/New_York', currency: 'USD' };
    case 'UK': return { timezone: 'Europe/London', currency: 'GBP' };
    case 'AU': return { timezone: 'Australia/Sydney', currency: 'AUD' };
    case 'CA': return { timezone: 'America/Toronto', currency: 'CAD' };
    default: return { timezone: 'UTC', currency: 'USD' };
  }
};
`;

code = code.replace("export function OnboardingFlow() {", defaultsHelper + "\nexport function OnboardingFlow() {");

// Update handleComplete
code = code.replace(
  "timezone: 'UTC',\n        default_currency: 'USD'",
  "timezone: getCountryDefaults(country).timezone,\n        default_currency: getCountryDefaults(country).currency"
);

code = code.replace(
  "state: '',\n        city: propertyCity,\n        address: '',\n        timezone: 'UTC',\n        currency: 'USD',",
  "state: propertyState,\n        city: propertyCity,\n        address: propertyAddress,\n        timezone: getCountryDefaults(country).timezone,\n        currency: getCountryDefaults(country).currency,"
);

// Add state and address inputs to case 4
const newInputs = `
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input 
                    id="state" 
                    placeholder="e.g. Maharashtra" 
                    value={propertyState} 
                    onChange={e => setPropertyState(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    placeholder="e.g. Mumbai" 
                    value={propertyCity} 
                    onChange={e => setPropertyCity(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  placeholder="e.g. 123 Main St" 
                  value={propertyAddress} 
                  onChange={e => setPropertyAddress(e.target.value)}
                />
              </div>
`;

code = code.replace(
  /<div className="space-y-2">\s*<Label htmlFor="city">City \/ Location<\/Label>\s*<Input \s*id="city" \s*placeholder="e\.g\. San Francisco" \s*value={propertyCity} \s*onChange=\{e => setPropertyCity\(e\.target\.value\)\}\s*\/>\s*<\/div>/g,
  newInputs
);

fs.writeFileSync('src/features/onboarding/OnboardingFlow.tsx', code);
