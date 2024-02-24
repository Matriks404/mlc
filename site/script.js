var config = {};
var versionGroups = {};
var loadedVersionGroupId = "";
var loadedVersionId = "";
var areSettingsUpdated = false;

var excludeCheckboxes = [
	'exclude-migratable',
	'exclude-obtainable-by-block-transmutation',
	'exclude-obtainable-by-notch',
	'exclude-obtainable-in-winter-mode',
];

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
		}

		var idString;

		if (id.includes(':')) {
			var basicEntryId = id.substr(0, id.indexOf(':'));

			if (entries[basicEntryId + ':1']) {
				var damageValue = id.substr(id.indexOf(':') + 1);
				idString = id
			}

			idString = basicEntryId;
		} else {
			idString = id;
		}

		idElement.innerHTML = idString;

		if (hasUnknownIds) {
			idElement.innerHTML += '?';
		}

		if (damageValue) {
			var damageElement = document.createElement('div');
			idElement.appendChild(damageElement);
			damageElement.className = 'damage-value';
			damageElement.innerHTML = damageValue;
		}

		var fieldElement = document.createElement('div');
		fieldElement.className = 'field';
		entryElement.appendChild(fieldElement);

		var img = document.createElement('img');

		if (entry.sprite) {
			img.src = 'images/' + entriesName + '/' + entry.sprite + '.png';
		} else {
			img.src = 'images/unknown.png';
		}

		fieldElement.appendChild(img);

		if (entry.name) {
			entryElement.className += ' with-tooltip'

			var tooltip = document.createElement('div');
			tooltip.className = 'tooltip';

			tooltip.innerHTML = entry.name;

			entryElement.appendChild(tooltip);
		}
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

function isAnyEntryWithProperty(entries, property) {
	var countAirBlock = document.getElementById('display-air-block').checked;

	return Object.keys(entries).some(function (id) {
		var entry = entries[id]

		if (!countAirBlock && id == "0") {
			return false;
		}

		if (entry[property]) {
			return true;
		}

		return false;
	});
}

function checkEntries(categories) {
	var checks = [
		{id: 'unobtainable', property: 'isUnobtainable'},
		{id: 'migratable', property: 'isObtainableByMigration'},
		{id: 'obtainable-by-block-transmutation', property: 'isObtainableByBlockTransmutation'},
		{id: 'obtainable-by-notch', property: 'isObtainableByNotch'},
		{id: 'obtainable-in-winter-mode', property: 'isObtainableInWinterMode'}
	];

	checks.forEach(function (check) {
		check.infoEl = document.getElementById('info-' + check.id);
		check.infoEl.style.display = "none";

		check.excludeEl = document.getElementById('exclude-' + check.id);
	});

	categories.forEach(function (entries) {
		checks.forEach(function (check) {
			if (check.infoEl.style.display == "block") {
				return;
			}

			var excluded = check.excludeEl.checked;

			if (excluded || !isAnyEntryWithProperty(entries, check.property)) {
				check.infoEl.style.display = "none";
			} else {
				check.infoEl.style.display = "block";
			}
		});
	});
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

	var properties = [
		['info-needs-testing', 'needsTesting'],
		['info-early-classic', 'isEarlyClassic'],
		['info-no-official-tooltip-names', 'hasNoOfficialTooltipNames'],
		['info-unknown-renders', 'hasUnknownRenders'],
		['info-unknown-block-ids', 'hasUnknownBlockIds'],
		['info-unknown-item-ids', 'hasUnknownItemIds']
	];

	properties.forEach(function (property) {
		checkVersionProperty(property[0], version, property[1]);
	});

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

	if (version.items) {
		checkEntries([version.blocks, version.items]);
	} else {
		checkEntries([version.blocks]);
	}
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

	var displayAirBlockCheckbox = document.getElementById('display-air-block');

	document.getElementById('exclude-unobtainable').addEventListener('change', function () {
		updateSettingsStatus();

		var excludeUnobtainable = this.checked;

		excludeCheckboxes.forEach(function (checkboxId) {
			var checkbox = document.getElementById(checkboxId);

			checkbox.disabled = !excludeUnobtainable;

			if (!excludeUnobtainable) {
				checkbox.checked = false;
			}
		});

		if (excludeUnobtainable) {
			displayAirBlockCheckbox.disabled = "disabled"
			displayAirBlockCheckbox.checked = false;
		} else {
			displayAirBlockCheckbox.disabled = "";
		}
	});

	excludeCheckboxes.forEach(function (checkboxId) {
		var checkbox = document.getElementById(checkboxId);

		checkbox.addEventListener('change', updateSettingsStatus);
	});

	displayAirBlockCheckbox.addEventListener('change', updateSettingsStatus);
});