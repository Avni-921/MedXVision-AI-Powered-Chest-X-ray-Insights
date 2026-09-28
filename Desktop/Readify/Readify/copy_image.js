import fs from 'fs';
import path from 'path';

// Source is in the brain/artifacts folder
const source = String.raw`c:\Users\KIIT0001\.gemini\antigravity\brain\54f56e32-ba7d-4b1e-a8f4-642cefa1ccc5\readify_ui_mockup_1767979326199.png`;
const dest = path.join(process.cwd(), 'public', 'readify_ui_mockup.png');

try {
    fs.copyFileSync(source, dest);
    console.log('Success: Image copied to ' + dest);
} catch (err) {
    console.error('Error copying file:', err);
    process.exit(1);
}
