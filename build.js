// build.js
const fs = require('fs-extra');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const publicDir = path.join(__dirname, 'public');
const outputFile = path.join(publicDir, 'apps.json');

async function buildAppList() {
  console.log('Scanning for apps...');
  try {
    // Ensure public directory exists
    await fs.ensureDir(publicDir);

    // Read all items in the apps directory
    const appFolders = await fs.readdir(appsDir);
    
    const allApps = [];

    // Use Promise.all to process all app folders concurrently
    await Promise.all(appFolders.map(async (folderName) => {
      const appPath = path.join(appsDir, folderName);
      const infoPath = path.join(appPath, 'info.json');

      // Check if it's a directory and has an info.json
      const stat = await fs.stat(appPath);
      if (stat.isDirectory() && await fs.pathExists(infoPath)) {
        try {
          const infoContent = await fs.readJson(infoPath);
          
          // Add the app's folder name as its ID and URL path
          allApps.push({
            id: folderName,
            url: `../apps/${folderName}/`, // Path relative to public/index.html
            title: infoContent.title || 'Untitled App',
            description: infoContent.description || 'No description.',
            thumbnail: infoContent.thumbnail ? `../apps/${folderName}/${infoContent.thumbnail}` : 'httpsax://via.placeholder.com/400x300.png?text=No+Image', // Default placeholder
          });
          console.log(`- Found app: ${infoContent.title}`);
        } catch (err) {
          console.error(`Error processing app in ${folderName}: ${err.message}`);
        }
      }
    }));

    // Sort apps alphabetically by title
    allApps.sort((a, b) => a.title.localeCompare(b.title));

    // Write the final JSON file
    await fs.writeJson(outputFile, allApps, { spaces: 2 });
    console.log(`Successfully built ${allApps.length} apps to ${outputFile}`);

  } catch (error) {
    console.error('Error building app list:', error);
    process.exit(1); // Exit with an error code
  }
}

buildAppList();
