const watchedFolders = [
  {
    resourceType: 'folder',
    resourceName: 'Demo 1',
    resourceId: 'YOUR FOLDER ID' // Replace with your actual folder ID
  }
];

// Ensure to include the ObjectStore library for persistent storage.
// More info at: https://classroomtechtools.github.io/ObjectStore/
const persistentStore = ObjectStore.create('script', {manual: true});

function monitorFolders() {
  let folderResource, currentFiles, previousFileCount;
  let newFileCount = 0;
  for(let folder of watchedFolders) {
    folderResource = fetchResource(folder);
    previousFileCount = persistentStore.get(folder.resourceId);
    
    // Initialize folder count in store if not already present.
    if(previousFileCount === null) {
      previousFileCount = initializeFolderInStore(folder);
    }
    
    currentFiles = folderResource.getFiles();
    while(currentFiles.hasNext()) {
      currentFiles.next();
      newFileCount++;
    }

    // Check for new file additions.
    if(newFileCount !== previousFileCount) {
      MailApp.sendEmail({
        to: 'YOUR EMAIL', // Specify your email address
        subject: `New file in "${folder.resourceName}"`,
        htmlBody: `A new file has been added to "${folderResource.getName()}". Access it here: ${folderResource.getUrl()}`
      });

      // Update the file count in the store after sending the email.
      persistentStore.set(folder.resourceId, newFileCount);
      persistentStore.persist();
    } else {
      console.log('No new files added.');
    }
  }
}

function initializeFolderInStore(folderInfo) {
  // Set initial file count for a new folder being monitored.
  persistentStore.set(folderInfo.resourceId, 0);
  persistentStore.persist();
  return persistentStore.get(folderInfo.resourceId);
}

// Utility function to fetch Google Drive resources by ID.
function fetchResource(resourceDetails) {
  switch(resourceDetails.resourceType) {
    case "folder":
      return DriveApp.getFolderById(resourceDetails.resourceId);
    case "file":
      return DriveApp.getFileById(resourceDetails.resourceId);
  }
}
