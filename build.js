// build.js
const fs = require('fs-extra');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const publicDir = path.join(__dirname, 'public');
const outputFile = path.join(publicDir, 'apps.json');

// Helper function to format folder names into titles
function formatTitle(folderName) {
  return folderName
    .replace(/[_-]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}

async function buildAppList() {
  console.log('Scanning for apps...');
  try {
    await fs.ensureDir(publicDir);
    const appFolders = await fs.readdir(appsDir);
    const allApps = [];

    await Promise.all(appFolders.map(async (folderName) => {
      const appPath = path.join(appsDir, folderName);
      const indexPath = path.join(appPath, 'index.html');
      const infoPath = path.join(appPath, 'info.json');

      const stat = await fs.stat(appPath);
      const hasIndex = await fs.pathExists(indexPath);

      // --- New Logic ---
      // A folder is a valid app if it's a directory and has an index.html
      if (stat.isDirectory() && hasIndex) {
        
        // 1. Set default values
        let title = formatTitle(folderName);
        let description = 'No description provided.';
        let thumbnail = null;

        // 2. Check for info.json and override defaults
        if (await fs.pathExists(infoPath)) {
          try {
            const infoContent = await fs.readJson(infoPath);
            title = infoContent.title || title;
            description = infoContent.description || description;
            if (infoContent.thumbnail) {
              thumbnail = `../apps/${folderName}/${infoContent.thumbnail}`;
            }
          } catch (err) {
            console.error(`Error reading info.json in ${folderName}: ${err.message}`);
          }
        }

        // 3. If thumbnail is still not set, auto-detect common names
        if (!thumbnail) {
          if (await fs.pathExists(path.join(appPath, 'thumbnail.png'))) {
            thumbnail = `../apps/${folderName}/thumbnail.png`;
          } else if (await fs.pathExists(path.join(appPath, 'thumbnail.jpg'))) {
            thumbnail = `../apps/${folderName}/thumbnail.jpg`;
          } else if (await fs.pathExists(path.join(appPath, 'thumbnail.jpeg'))) {
            thumbnail = `../apps/${folderName}/thumbnail.jpeg`;
          }
        }
        
        // 4. If still no thumbnail, use a placeholder
        if (!thumbnail) {
          thumbnail = `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(title)}`;
        }

        // 5. Add the app to the list
        allApps.push({
          id: folderName,
          url: `../apps/${folderName}/`,
          title: title,
          description: description,
          thumbnail: thumbnail,
        });
        console.log(`- Found app: ${title}`);

      }
    }));

    // Sort apps alphabetically by title
    allApps.sort((a, b) => a.title.localeCompare(b.title));

    // Write the final JSON file
    await fs.writeJson(outputFile, allApps, { spaces: 2 });
    console.log(`Successfully built ${allApps.length} apps to ${outputFile}`);

  } catch (error) {
    console.error('Error building app list:', error);
    process.exit(1);
  }
}

buildAppList();
