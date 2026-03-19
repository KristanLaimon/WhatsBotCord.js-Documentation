import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/content/docs', function(filePath) {
  if (filePath.endsWith('.mdx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // TypeScript icon injection
    let newContent = content.replace(/<TabItem\s+label="TypeScript"((?:\s+icon="[^"]*")?)\s*>/g, (match, iconAttr) => {
        if (!iconAttr || iconAttr.trim() === '') {
            changed = true;
            return '<TabItem label="TypeScript" icon="seti:typescript">';
        }
        return match;
    });

    // JavaScript icon injection 
    newContent = newContent.replace(/<TabItem\s+label="JavaScript"((?:\s+icon="[^"]*")?)\s*>/g, (match, iconAttr) => {
        if (!iconAttr || iconAttr.trim() === '') {
            changed = true;
            return '<TabItem label="JavaScript" icon="seti:javascript">';
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(filePath, newContent);
        console.log("Updated " + filePath);
    }
  }
});
