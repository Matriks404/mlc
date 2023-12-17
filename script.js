let config = {};
let versionGroups = {};
let currentVersionId = "";
let areSettingsUpdated = false;

async function fetchJSONData(filename) {
	return fetch(filename)
	.then((res) => res.json())
	.then((data) => {
		return data;
	});
}

async function loadConfig() {
	config = await fetchJSONData('./config.json');

	let versionNumber = config.versionNumber;
	let versionType = config.versionType;
	let versionEasyName = config.versionEasyName;

	let version_string = "";

	if (versionType == "release") {
		version_string = "v" + versionNumber + " (" + versionEasyName + ")";
	} else {
		version_string = "v" + versionNumber + "-" + versionType + " (" + versionEasyName + ")";
	}

	let versionInfoElement = document.getElementById('version-info');
	versionInfoElement.innerHTML = version_string;
}

async function loadVersionGroupList() {
	versionGroups = await fetchJSONData('./ids.json');

	let el = document.getElementById('version-groups');

	let emptyOption = document.createElement('option');
	emptyOption.text = "Select group >>>";
	emptyOption.setAttribute('value', 'empty');
	el.add(emptyOption);

	Object.keys(versionGroups).forEach((id) => {
		let option = document.createElement('option');
		option.setAttribute('value', id);

		option.text = versionGroups[id].name;

		el.add(option)
	});
}

function removeSelectOptions(el) {
   var i, length = el.options.length - 1;
   for(i = length; i >= 0; i--) {
      el.remove(i);
   }
}

async function loadVersionList() {
	let groupId = document.getElementById('version-groups').value;
	console.log("Current version group ID: " + groupId);

	let el = document.getElementById('versions');
	removeSelectOptions(el);

	if (groupId == 'empty') {
		el.disabled = "disabled";

		return;
	}

	el.disabled = "";

	let versions = versionGroups[groupId].versions

	Object.keys(versions).forEach((id) => {
		let option = document.createElement('option');
		option.setAttribute('value', id);

		option.text = versions[id].name;

		el.add(option)
	});
}

function loadEntries(entries, el, entriesName) {
	let excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
	let excludeMigratable = document.getElementById('exclude-migratable').checked;
	let displayAirBlock = document.getElementById('display-air-block').checked;

	Object.keys(entries).forEach((id) => {
		if (excludeUnobtainable && entries[id].isUnobtainable) {
			return;
		}

		if (excludeMigratable && entries[id].isObtainableByMigration) {
			return;
		}

		if (!displayAirBlock && id == "0") {
			return;
		}

		let entry = document.createElement('div');
		el.appendChild(entry);
		entry.classList.add('entry');

		let idElement = document.createElement('div');
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

		let imageContainer = document.createElement('div');
		imageContainer.classList.add('with-tooltip');
		entry.appendChild(imageContainer);

		let img = document.createElement('img');
		img.src = 'images/' + entriesName + '/' + entries[id].sprite + '.png';
		imageContainer.appendChild(img);

		let tooltip = document.createElement('div');
		tooltip.classList.add('tooltip');

		let name = entries[id].name ? entries[id].name : "NO NAME";
		tooltip.innerHTML = name;

		imageContainer.appendChild(tooltip);
	});
}

function checkVersionProperty(elementName, version, property) {
	let el = document.getElementById(elementName);

	if (version[property]) {
		el.style.display = "block";
	} else {
		el.style.display = "none";
	}
}

function doEntriesContainEntryType(entries, type) {
	let excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
	let excludeMigratable = document.getElementById('exclude-migratable').checked;
	let countAirBlock = document.getElementById('display-air-block').checked;

	return Object.keys(entries).some((id) => {
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
		el.style.display = "block"
	} else {
		el.style.display = "none"
	}
}


function loadCurrentVersion() {
	let groupId = document.getElementById('version-groups').value;

	if (groupId == 'empty') {
		alert("To see available blocks and items, select appropriate version first.")

		return;
	}

	let id = document.getElementById('versions').value;

	if (!areSettingsUpdated && id == currentVersionId) {
		console.log("User tried to load version that is already loaded!")

		return;
	}

	areSettingsUpdated = false;

	console.log("Current version ID: " + id);
	currentVersionId = id;

	let versions = versionGroups[groupId].versions

	if (!versions[id]) {
		alert("Invalid game version!");

		return
	}

	let blocks = versions[id].blocks

	if (!blocks || !Object.keys(blocks).length) {
		alert(id + " game version blocks data is corrupted!");

		return
	}

	let info = document.getElementById('info');
	info.style.display = "flex";

	checkVersionProperty('info-early-classic', versions[id], 'isEarlyClassic')
	checkVersionProperty('info-unknown-block-renders', versions[id], 'hasUnknownBlockRenders')
	checkVersionProperty('info-unknown-item-ids', versions[id], 'hasUnknownItemIds')
	checkVersionProperty('info-presumed-item-ids', versions[id], 'hasPresumedItemIds')

	let oldMainElement = document.getElementsByTagName('main')[0]

	if (oldMainElement) {
		document.body.removeChild(oldMainElement);
	}

	let newMainElement = document.createElement('main');
	document.body.insertBefore(newMainElement, info);

	let blocksElement = document.createElement('fieldset');
	newMainElement.appendChild(blocksElement);
	blocksElement.setAttribute('id', 'blocks');

	let blocksLegendElement = document.createElement('legend');
	blocksElement.appendChild(blocksLegendElement);
	blocksLegendElement.innerHTML = 'Blocks';

	let infoUnobtainableElement = document.getElementById('info-unobtainable');
	let infoMigratableElement = document.getElementById('info-migratable');
	let infoRemovedElement = document.getElementById('info-removed')

	checkEntries(blocks, infoUnobtainableElement, "isUnobtainable")
	checkEntries(blocks, infoMigratableElement, "isObtainableByMigration")
	checkEntries(blocks, infoRemovedElement, "isRemoved")

	loadEntries(blocks, blocksElement, "blocks");

	let items = versions[id].items

	if (items && Object.keys(items).length) {
		let itemsElement = document.createElement('fieldset');
		newMainElement.appendChild(itemsElement);
		itemsElement.setAttribute('id', 'items');

		let itemsLegendElement = document.createElement('legend');
		itemsElement.appendChild(itemsLegendElement);
		itemsLegendElement.innerHTML = 'Items'

		if (infoUnobtainableElement.style.display == "none") {
			checkEntries(items, infoUnobtainableElement, "isUnobtainable")
		}

		if (infoMigratableElement.style.display == "none") {
			checkEntries(items, infoMigratableElement, "isObtainableByMigration")
		}

		if (infoRemovedElement.style.display == "none") {
			checkEntries(items, infoRemovedElement, "isRemoved")
		}

		loadEntries(items, itemsElement, "items")
	}

	let elementsWithTooltips = document.querySelectorAll('.with-tooltip')

	elementsWithTooltips.forEach(el => {
		el.addEventListener('mousemove', (e) => {
			let x = (e.clientX + 18) + 'px';
			let y = (e.clientY - 30) + 'px';

			let tooltip = el.querySelectorAll('.tooltip')[0]
			tooltip.style.left = x;
			tooltip.style.top = y;
		});
	});
}

function updateSettingsStatus() {
	areSettingsUpdated = true;
}

loadConfig();
loadVersionGroupList();

document.addEventListener('DOMContentLoaded', () => {
	let checkboxes = document.querySelectorAll(':checked');

	checkboxes.forEach((el) => {
		el.checked = false;
	});

	let versionList = document.getElementById('versions');
	versionList.disabled = "disabled";

	let excludeMigratableCheckbox = document.getElementById('exclude-migratable');
	excludeMigratableCheckbox.disabled = "disabled";
});

document.getElementById('version-groups').addEventListener('change', loadVersionList);
document.getElementById('ok').addEventListener('click', loadCurrentVersion);

document.getElementById('exclude-unobtainable').addEventListener('change', () => {
	updateSettingsStatus()

	let excludeUnobtainable = document.getElementById('exclude-unobtainable').checked;
	let excludeMigratableCheckbox = document.getElementById('exclude-migratable');
	let displayAirCheckbox = document.getElementById('display-air-block');

	if (excludeUnobtainable) {
		excludeMigratableCheckbox.disabled = "";

		displayAirCheckbox.checked = false;
		displayAirCheckbox.disabled = "disabled";
	} else {
		excludeMigratableCheckbox.checked = false;
		excludeMigratableCheckbox.disabled = "disabled"

		displayAirCheckbox.disabled = "";
	}
});

document.getElementById('exclude-migratable').addEventListener('change', updateSettingsStatus);
document.getElementById('display-air-block').addEventListener('change', updateSettingsStatus);