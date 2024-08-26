chrome.commands.onCommand.addListener((command) => {
	if (command === "open-latvian-folder") {
		openLatvianBookmark();
	}
});

function openLatvianBookmark() {
	chrome.tabGroups.query({ title: "Latviešu" }, (results) => {
		if (results.length > 0) {
			const latvianGroupId = results[0].id;

			// Get all tabs in the group and close them
			chrome.tabs.query({ groupId: latvianGroupId }, (tabs) => {
				const tabIds = tabs.map(tab => tab.id);
				chrome.tabs.remove(tabIds);
			});
		} else {
			chrome.bookmarks.search({ title: "Latviešu" }, (results) => {
				if (results.length > 0) {
					const folderId = results[0].id;
					chrome.bookmarks.getChildren(folderId, (bookmarks) => {
						if (bookmarks.length > 0) {
							let latvianGroupId = null;

							// Create the first tab and then create the group with it
							const firstBookmark = bookmarks[0];
							if (firstBookmark.url) {
								chrome.tabs.create({ url: firstBookmark.url }, (tab) => {
									chrome.tabs.group({ tabIds: tab.id }, (groupId) => {
										latvianGroupId = groupId;
										chrome.tabGroups.update(groupId, {
											title: "Latviešu",
											color: "green"
										});

										// Add the remaining bookmarks to the group
										bookmarks.slice(1).forEach((bookmark) => {
											if (bookmark.url) {
												chrome.tabs.create({ url: bookmark.url }, (newTab) => {
													chrome.tabs.group({ tabIds: newTab.id, groupId: latvianGroupId });
												});
											}
										});
									});
								});
							}
						}
					});
				}
			});
		}
	});
}