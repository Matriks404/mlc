var config = {};
var versionGroups = {};
var currentVersionId = "";
var areSettingsUpdated = false;

function fetchJSONData(filename) {
	return fetch(filename)
	.then(function (res) {
		return res.json();
	})
	.then(function (data) {
		return data;
	});
}

function loadConfig() {
	return fetchJSONData('./config.json')
	.then(function (config) {
		var versionNumber = config.versionNumber;
		var versionType = config.versionType;
		var versionEasyName = config.versionEasyName;

		var version_string = "";

		if (versionType == "release") {
			version_string = "v" + versionNumber + " (" + versionEasyName + ")";
		} else {
			version_string = "v" + versionNumber + "-" + versionType + " (" + versionEasyName + ")";
		}

		var versionInfoElement = document.getElementById('version-info');
		versionInfoElement.innerHTML = version_string;
	});
}

function loadVersionGroupList() {

	return fetchJSONData('./ids.json')
	.then(function (groups) {
		versionGroups = groups;

		var el = document.getElementById('version-groups');

		var emptyOption = document.createElement('option');
		emptyOption.text = "Select group >>>";
		emptyOption.setAttribute('value', 'empty');
		el.add(emptyOption);

		Object.keys(versionGroups).forEach(function (id) {
			var versions = versionGroups[id].versions;

			if (!versions || !Object.keys(versions).length) {
				console.log(id + " version group data is corrupted!");

				return;
			}

			var option = document.createElement('option');
			option.setAttribute('value', id);

			option.text = versionGroups[id].name;

			el.add(option);
		});
	});
}

function loadVersionList() {
	var groupId = document.getElementById('version-groups').value;
	console.log("Current version group ID: " + groupId);

	var el = document.getElementById('versions');
	removeSelectOptions(el);

	if (groupId == 'empty') {
		el.disabled = "disabled";

		return;
	}

	el.disabled = "";

	var versions = versionGroups[groupId].versions;

	Object.keys(versions).forEach(function (id) {
		var option = document.createElement('option');
		option.setAttribute('value', id);

		option.text = versions[id].name;

		el.add(option);
	});
}

function loadEntries(entries, el, entriesName) {
	var excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
	var excludeMigratable = document.getElementById('exclude-migratable').checked;
	var displayAirBlock = document.getElementById('display-air-block').checked;

	Object.keys(entries).forEach(function (id) {
		if (excludeUnobtainable && entries[id].isUnobtainable) {
			return;
		}

		if (excludeMigratable && entries[id].isObtainableByMigration) {
			return;
		}

		if (!displayAirBlock && id == "0") {
			return;
		}

		var entry = document.createElement('div');
		el.appendChild(entry);
		entry.classList.add('entry');

		var idElement = document.createElement('div');
		entry.appendChild(idElement);
		idElement.classList.add('id');

		if (entries[id].isUnobtainable) {
			idElement.classList.add('id-unobtainable');
		} else if (entries[id].isObtainableByMigration) {
			idElement.classList.add('id-migratable');
		} else if (entries[id].isRemoved) {
			idElement.classList.add('id-removed');
		}

		idElement.innerHTML = id;

		var elementWithTooltip = document.createElement('div');
		elementWithTooltip.classList.add('with-tooltip');
		entry.appendChild(elementWithTooltip);

		var imageContainer = document.createElement('div');
		imageContainer.classList.add('img-container');
		elementWithTooltip.appendChild(imageContainer);

		var img = document.createElement('img');
		img.src = 'images/' + entriesName + '/' + entries[id].sprite + '.png';
		imageContainer.appendChild(img);

		var tooltip = document.createElement('div');
		tooltip.classList.add('tooltip');

		var name = entries[id].name ? entries[id].name : "NO NAME";
		tooltip.innerHTML = name;

		elementWithTooltip.appendChild(tooltip);
	});
}

function checkVersionProperty(elementName, version, property) {
	var el = document.getElementById(elementName);

	if (version[property]) {
		el.style.display = "block";
	} else {
		el.style.display = "none";
	}
}

function doEntriesContainEntryType(entries, type) {
	var excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
	var excludeMigratable = document.getElementById('exclude-migratable').checked;
	var countAirBlock = document.getElementById('display-air-block').checked;

	return Object.keys(entries).some(function (id) {
		if (excludeUnobtainable && entries[id].isUnobtainable) {
			return false;
		}

		if (excludeMigratable && entries[id].isObtainableByMigration) {
			return false;
		}

		if (!countAirBlock && id == "0") {
			return false;
		}

		if (entries[id][type]) {
			return true;
		}

		return false;
	});
}

function checkEntries(entries, el, type) {
	if (doEntriesContainEntryType(entries, type)) {
		el.style.display = "block";
	} else {
		el.style.display = "none";
	}
}


function loadCurrentVersion() {
	var groupId = document.getElementById('version-groups').value;

	if (groupId == 'empty') {
		alert("To see available blocks and items, select appropriate version first.");

		return;
	}

	var id = document.getElementById('versions').value;

	if (!areSettingsUpdated && id == currentVersionId) {
		console.log("User tried to load version that is already loaded!");

		return;
	}

	areSettingsUpdated = false;

	console.log("Current version ID: " + id);
	currentVersionId = id;

	var versions = versionGroups[groupId].versions;

	if (!versions[id]) {
		alert("Invalid game version!");

		return;
	}

	var blocks = versions[id].blocks;

	if (!blocks || !Object.keys(blocks).length) {
		alert(id + " game version blocks data is corrupted!");

		return;
	}

	var info = document.getElementById('info');
	info.style.display = "flex";

	checkVersionProperty('info-early-classic', versions[id], 'isEarlyClassic');
	checkVersionProperty('info-unknown-block-renders', versions[id], 'hasUnknownBlockRenders');
	checkVersionProperty('info-unknown-item-ids', versions[id], 'hasUnknownItemIds');
	checkVersionProperty('info-presumed-item-ids', versions[id], 'hasPresumedItemIds');

	var containerElement = document.getElementById('container');
	var oldMainElement = document.getElementsByTagName('main')[0];

	if (oldMainElement) {
		container.removeChild(oldMainElement);
	}

	var newMainElement = document.createElement('main');
	container.insertBefore(newMainElement, info);

	var blocksElement = document.createElement('fieldset');
	newMainElement.appendChild(blocksElement);
	blocksElement.setAttribute('id', 'blocks');

	var blocksLegendElement = document.createElement('legend');
	blocksElement.appendChild(blocksLegendElement);
	blocksLegendElement.innerHTML = 'Blocks';

	var blocksContentElement = document.createElement('div');
	blocksElement.appendChild(blocksContentElement);
	blocksContentElement.classList.add('fieldset-content');

	var infoUnobtainableElement = document.getElementById('info-unobtainable');
	var infoMigratableElement = document.getElementById('info-migratable');
	var infoRemovedElement = document.getElementById('info-removed');

	checkEntries(blocks, infoUnobtainableElement, "isUnobtainable");
	checkEntries(blocks, infoMigratableElement, "isObtainableByMigration");
	checkEntries(blocks, infoRemovedElement, "isRemoved");

	loadEntries(blocks, blocksContentElement, "blocks");

	var items = versions[id].items;

	if (items && Object.keys(items).length) {
		var itemsElement = document.createElement('fieldset');
		newMainElement.appendChild(itemsElement);
		itemsElement.setAttribute('id', 'items');

		var itemsLegendElement = document.createElement('legend');
		itemsElement.appendChild(itemsLegendElement);
		itemsLegendElement.innerHTML = 'Items';

		var itemsContentElement = document.createElement('div');
		itemsElement.appendChild(itemsContentElement);
		itemsContentElement.classList.add('fieldset-content');

		if (infoUnobtainableElement.style.display == "none") {
			checkEntries(items, infoUnobtainableElement, "isUnobtainable");
		}

		if (infoMigratableElement.style.display == "none") {
			checkEntries(items, infoMigratableElement, "isObtainableByMigration");
		}

		if (infoRemovedElement.style.display == "none") {
			checkEntries(items, infoRemovedElement, "isRemoved");
		}

		loadEntries(items, itemsContentElement, "items");
	}

	var elementsWithTooltips = document.querySelectorAll('.with-tooltip');

	Array.prototype.forEach.call(elementsWithTooltips, function (el) {
		el.addEventListener('mousemove', function (e) {
			var xOffset = 18;
			var yOffset = -30;

			var x = (e.clientX + xOffset) + 'px';
			var y = (e.clientY + yOffset) + 'px';

			var tooltip = el.querySelectorAll('.tooltip')[0];
			var tooltipWidth = tooltip.offsetWidth;
			var windowWidth = window.innerWidth;
			var spaceOnRight = windowWidth - (e.clientX + tooltipWidth + xOffset);

			// Check if there's not enough space on the right. Let it be 4px to be sure nothing breaks.
			if (spaceOnRight < 4) {
				// Push the tooltip slightly to the left
				x = (e.clientX + spaceOnRight) + 'px';
			}

			tooltip.style.left = x;
			tooltip.style.top = y;
		});
	});
}

function reloadCheckboxes() {
	var checkboxes = document.querySelectorAll(':checked');

	Array.prototype.forEach.call(checkboxes, function(el) {
		el.checked = false;
	});

	var excludeMigratableCheckbox = document.getElementById('exclude-migratable');
	excludeMigratableCheckbox.disabled = "disabled";
}

function reloadVersionList() {
	var versionList = document.getElementById('versions');
	versionList.disabled = "disabled";
}

function removeSelectOptions(el) {
   var i, length = el.options.length - 1;
   for(i = length; i >= 0; i--) {
      el.remove(i);
   }
}

function handleLegalInfo() {
	var legalInfoMessageBox = document.getElementById('legal-info');
	var dismissButton = document.getElementById('dismiss-button');

	// TODO: Not sure if we want to allow user to dismiss legal message forever.
	/*if (localStorage.getItem('dismissed')) {
		legalInfoMessageBox.style.display = "none";
	}*/

	dismissButton.addEventListener('click', function() {
		legalInfoMessageBox.style.display = 'none';

		// TODO: Not sure if we want to allow user to dismiss legal message forever.
		/*localStorage.setItem('dismissed', true);*/
	});
}

function updateSettingsStatus() {
	areSettingsUpdated = true;
}

document.addEventListener('DOMContentLoaded', function () {
	loadConfig();
	loadVersionGroupList();

	reloadCheckboxes();
	reloadVersionList();

	handleLegalInfo();

	document.getElementById('version-groups').addEventListener('change', loadVersionList);
	document.getElementById('ok').addEventListener('click', loadCurrentVersion);

	document.getElementById('exclude-unobtainable').addEventListener('change', function () {
		updateSettingsStatus();

		var excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
		var excludeMigratableCheckbox = document.getElementById('exclude-migratable');
		var displayAirCheckbox = document.getElementById('display-air-block');

		if (excludeUnobtainable) {
			excludeMigratableCheckbox.disabled = "";

			displayAirCheckbox.checked = false;
			displayAirCheckbox.disabled = "disabled";
		} else {
			excludeMigratableCheckbox.checked = false;
			excludeMigratableCheckbox.disabled = "disabled";

			displayAirCheckbox.disabled = "";
		}
	});

	document.getElementById('exclude-migratable').addEventListener('change', updateSettingsStatus);

	document.getElementById('display-air-block').addEventListener('change', updateSettingsStatus);
});

