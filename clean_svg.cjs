const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const content = fs.readFileSync('C:\\Users\\Dell\\.gemini\\antigravity\\brain\\1c85f091-0e7e-4d2d-903c-14e6152b22db\\.system_generated\\steps\\236\\content.md', 'utf8');

const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
if (!svgMatch) {
  console.log('No SVG found');
  process.exit(1);
}

const svgString = svgMatch[0];

const dom = new JSDOM(svgString, { contentType: "image/svg+xml" });
const document = dom.window.document;
const svg = document.querySelector('svg');

const butterfly = document.getElementById('eswmPakG4bX352_to');

if (!butterfly) {
  console.log('No butterfly found');
  process.exit(1);
}

// Clear all SVG children
while (svg.firstChild) {
  svg.removeChild(svg.firstChild);
}

// Add back only the butterfly
svg.appendChild(butterfly);

fs.writeFileSync('c:\\harshitha\\harshitha-port\\portfolio-itom\\public\\images\\butterfly.svg', svg.outerHTML);
console.log('Saved to public/images/butterfly.svg');
