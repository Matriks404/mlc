var config = {};
var versionGroups = {};
var loadedVersionGroupId = "";
var loadedVersionId = "";
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

		var versionString = "";

		if (versionType == "release") {
			versionString = "v" + versionNumber + " (" + versionEasyName + ")";
		} else {
			versionString = "v" + versionNumber + "-" + versionType + " (" + versionEasyName + ")";
		}

		var versionInfoElement = document.getElementById('version-info');
		versionInfoElement.innerHTML = versionString;
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

			var name;

			if (versionGroups[id].name) {
				name = versionGroups[id].name
			} else {
				name = "UNTITLED GROUP [" + id + "]"
			}

			option.text = name;

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

		var version = versions[id]
		var name;

		if (version.name) {
			name = version.name
		} else {
			name = "UNTITLED VERSION [" + id + "]"
		}

		if (version.hasUnknownBlockIds || version.hasUnknownItemIds || version.hasUnknownRenders) {
			name += " [INCOMPLETE]";
		} else if (version.needsTesting) {
			name += " [NEEDS TESTING]";
		}

		option.text = name;

		el.add(option);
	});
}

function loadEntries(entries, el, entriesName, hasUnknownIds) {
	var excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
	var excludeMigratable = document.getElementById('exclude-migratable').checked;
	var excludeObtainableByBlockTransmutation = document.getElementById('exclude-obtainable-by-block-transmutation').checked;
	var excludeObtainableByNotch = document.getElementById('exclude-obtainable-by-notch').checked
	var excludeObtainableInWinterMode = document.getElementById('exclude-obtainable-in-winter-mode').checked
	var displayAirBlock = document.getElementById('display-air-block').checked;

	Object.keys(entries).forEach(function (id) {
		var entry = entries[id]

		if (excludeUnobtainable && entry.isUnobtainable) {
			return;
		}

		if (excludeMigratable && entry.isObtainableByMigration) {
			return;
		}

		if (excludeObtainableByBlockTransmutation && entry.isObtainableByBlockTransmutation) {
			return;
		}

		if (excludeObtainableByNotch && entry.isObtainableByNotch) {
			return;
		}

		if (excludeObtainableInWinterMode && entry.isObtainableInWinterMode) {
			return;
		}

		if (!displayAirBlock && (id == "0" || id == "0:0")) {
			return;
		}

		var entryElement = document.createElement('div');
		el.appendChild(entryElement);
		entryElement.className = 'entry';

		var idElement = document.createElement('div');
		entryElement.appendChild(idElement);
		idElement.className = 'id';

		if (entry.isUnobtainable) {
			idElement.className += ' id-unobtainable';
		} else if (entry.isObtainableByMigration) {
			idElement.className += ' id-migratable';
		} else if (entry.isObtainableByBlockTransmutation) {
			idElement.className += ' id-obtainable-by-block-transmutation';
		} else if (entry.isObtainableByNotch) {
			idElement.className += ' id-obtainable-by-notch';
		} else if (entry.isObtainableInWinterMode) {
			idElement.className += ' id-obtainable-in-winter-mode';
		} else if (entry.isRemoved) {
			idElement.className += ' id-removed';
		}

		idElement.innerHTML = id;

		if (hasUnknownIds) {
			idElement.innerHTML += '?';
		}

		var elementWithTooltip = document.createElement('div');
		elementWithTooltip.className = 'with-tooltip';
		entryElement.appendChild(elementWithTooltip);

		var img = document.createElement('img');

		if (entry.sprite) {
			img.src = 'images/' + entriesName + '/' + entry.sprite + '.png';
		} else {
			img.src = 'images/unknown.png';
		}

		elementWithTooltip.appendChild(img);

		var tooltip = document.createElement('div');
		tooltip.className = 'tooltip';

		var name = entry.name ? entry.name : "[NO NAME]";

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
	var excludeObtainableByBlockTransmutation = document.getElementById('exclude-obtainable-by-block-transmutation').checked;
	var excludeObtainableByNotch = document.getElementById('exclude-obtainable-by-notch').checked;
	var excludeObtainableInWinterMode = document.getElementById('exclude-obtainable-in-winter-mode').checked;
	var countAirBlock = document.getElementById('display-air-block').checked;

	return Object.keys(entries).some(function (id) {
		var entry = entries[id]

		if (excludeUnobtainable && entry.isUnobtainable) {
			return false;
		}

		if (excludeMigratable && entry.isObtainableByMigration) {
			return false;
		}

		if (excludeObtainableByNotch && entry.isObtainableByNotch) {
			return false;
		}

		if (excludeObtainableInWinterMode && entry.isObtainableInWinterMode) {
			return false;
		}

		if (!countAirBlock && id == "0") {
			return false;
		}

		if (entry[type]) {
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

	if (!areSettingsUpdated && groupId == loadedVersionGroupId && id == loadedVersionId) {
		console.log("User tried to load version that is already loaded!");

		return;
	}

	areSettingsUpdated = false;

	console.log("Loaded version: " + groupId + "/" + id);
	loadedVersionGroupId = groupId;
	loadedVersionId = id;

	var version = versionGroups[groupId].versions[id];

	if (!version) {
		alert("Invalid game version!");

		return;
	}

	var blocks = version.blocks;

	if (!blocks || !Object.keys(blocks).length) {
		alert(id + " game version blocks data is corrupted!");

		return;
	}

	var info = document.getElementById('info');
	info.style.display = "flex";

	checkVersionProperty('info-needs-testing', version, 'needsTesting');
	checkVersionProperty('info-early-classic', version, 'isEarlyClassic');
	checkVersionProperty('info-no-official-tooltip-names', version, 'hasNoOfficialTooltipNames')
	checkVersionProperty('info-unknown-renders', version, 'hasUnknownRenders');
	checkVersionProperty('info-unknown-block-ids', version, 'hasUnknownBlockIds');
	checkVersionProperty('info-unknown-item-ids', version, 'hasUnknownItemIds');

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
	blocksContentElement.className = 'fieldset-content';

	var infoUnobtainableElement = document.getElementById('info-unobtainable');
	var infoMigratableElement = document.getElementById('info-migratable');
	var infoObtainableByBlockTransmutationElement = document.getElementById('info-obtainable-by-block-transmutation');
	var infoObtainableByNotchElement = document.getElementById('info-obtainable-by-notch');
	var infoObtainableInWinterModeElement = document.getElementById('info-obtainable-in-winter-mode');
	var infoRemovedElement = document.getElementById('info-removed');

	checkEntries(blocks, infoUnobtainableElement, "isUnobtainable");
	checkEntries(blocks, infoMigratableElement, "isObtainableByMigration");
	checkEntries(blocks, infoObtainableByBlockTransmutationElement, "isObtainableByBlockTransmutation");
	checkEntries(blocks, infoObtainableByNotchElement, "isObtainableByNotch");
	checkEntries(blocks, infoObtainableInWinterModeElement, "isObtainableInWinterMode");
	checkEntries(blocks, infoRemovedElement, "isRemoved");

	loadEntries(blocks, blocksContentElement, "blocks", version.hasUnknownBlockIds);

	var items = version.items;

	if (items && Object.keys(items).length) {
		var itemsElement = document.createElement('fieldset');
		newMainElement.appendChild(itemsElement);
		itemsElement.setAttribute('id', 'items');

		var itemsLegendElement = document.createElement('legend');
		itemsElement.appendChild(itemsLegendElement);
		itemsLegendElement.innerHTML = 'Items';

		var itemsContentElement = document.createElement('div');
		itemsElement.appendChild(itemsContentElement);
		itemsContentElement.className = 'fieldset-content';

		if (infoUnobtainableElement.style.display == "none") {
			checkEntries(items, infoUnobtainableElement, "isUnobtainable");
		}

		if (infoMigratableElement.style.display == "none") {
			checkEntries(items, infoMigratableElement, "isObtainableByMigration");
		}

		if (infoObtainableByNotchElement.style.display == "none") {
			checkEntries(items, infoObtainableByNotchElement, "isObtainableByNotch");
		}

		if (infoObtainableInWinterModeElement.style.display == "none") {
			checkEntries(items, infoObtainableInWinterModeElement, "isObtainableInWinterMode");
		}

		if (infoRemovedElement.style.display == "none") {
			checkEntries(items, infoRemovedElement, "isRemoved");
		}

		loadEntries(items, itemsContentElement, "items", version.hasUnknownItemIds);
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

	var excludeObtainableByBlockTransmutationCheckbox = document.getElementById('exclude-obtainable-by-block-transmutation');
	excludeObtainableByBlockTransmutationCheckbox.disabled = "disabled";

	var excludeObtainableByNotchCheckbox = document.getElementById('exclude-obtainable-by-notch');
	excludeObtainableByNotchCheckbox.disabled = "disabled";

	var excludeObtainableInWinterModeCheckbox = document.getElementById('exclude-obtainable-in-winter-mode');
	excludeObtainableInWinterModeCheckbox.disabled = "disabled";
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
		var excludeObtainableByBlockTransmutationCheckbox = document.getElementById('exclude-obtainable-by-block-transmutation');
		var excludeObtainableByNotchCheckbox = document.getElementById('exclude-obtainable-by-notch');
		var excludeObtainableInWinterModeCheckbox = document.getElementById('exclude-obtainable-in-winter-mode');
		var displayAirCheckbox = document.getElementById('display-air-block');

		if (excludeUnobtainable) {
			excludeMigratableCheckbox.disabled = "";
			excludeObtainableByBlockTransmutationCheckbox.disabled = "";
			excludeObtainableByNotchCheckbox.disabled = "";
			excludeObtainableInWinterModeCheckbox.disabled = "";

			displayAirCheckbox.checked = false;
			displayAirCheckbox.disabled = "disabled";
		} else {
			excludeMigratableCheckbox.checked = false;
			excludeMigratableCheckbox.disabled = "disabled";

			excludeObtainableByBlockTransmutationCheckbox.checked = false;
			excludeObtainableByBlockTransmutationCheckbox.disabled = "disabled";

			excludeObtainableByNotchCheckbox.checked = false;
			excludeObtainableByNotchCheckbox.disabled = "disabled";

			excludeObtainableInWinterModeCheckbox.checked = false;
			excludeObtainableInWinterModeCheckbox.disabled = "disabled";

			displayAirCheckbox.disabled = "";
		}
	});

	document.getElementById('exclude-migratable').addEventListener('change', updateSettingsStatus);
	document.getElementById('exclude-obtainable-by-block-transmutation').addEventListener('change', updateSettingsStatus);
	document.getElementById('exclude-obtainable-by-notch').addEventListener('change', updateSettingsStatus);
	document.getElementById('exclude-obtainable-in-winter-mode').addEventListener('change', updateSettingsStatus);
	document.getElementById('display-air-block').addEventListener('change', updateSettingsStatus);
});