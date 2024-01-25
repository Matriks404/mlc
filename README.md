# Minecraft Legacy Companion

**Minecraft Legacy Companion** (or **MLC** for short) is a website designed to help you with various aspects of legacy **Minecraft** versions.

For now it can only be used to display block/items ID's (and their obtainability) in **Minecraft** Pre-Classic, Classic and Indev, but in the future it will be expanded up to newer versions (with varying level of support) and additional features.

If you want to see live version [go here](https://matriks404.github.io/mlc/).

Alternatively, for running locally go to the section [over there](#running-locally).

**NOT AN OFFICIAL MINECRAFT [PRODUCT/SERVICE/EVENT/etc.]. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT**

## Screenshot

<img alt="Minecraft Legacy Companion in a nutshell" src="./screenshots/1.png" height="360" />

## Functionality

Following table shows current and planned functionality:

|                  | Pre-Classic | Classic | Indev | Infdev | Alpha[^1] | Beta | Final (pre-flattening[^2]) | Final (after-flattening[^3]) |
| :--------------: | :---------: | :-----: | :---: | :----: | :---: | :--: | :------------------------: | :--------------------------: |
|  **Block ID's**  |      ✔️      |    ✔️    | ✔️[^4] |   ✔️[^5]    |   🔨   |  🔨   |             ❌              |              ❌               |
|  **Item ID's**   |      🚫      |    🚫    | ✔️[^4] |   ✔️[^5]    |   🔨[^6]   |  🔨   |             ❌              |              ❌               |
|   **Mob ID'S**   |      ❓      |    ❓    |   ❓   |   ❓    |   ❓   |  ❓   |             ❌              |              ❌               |
| **Achievements** |      🚫      |    🚫    |   🚫   |   🚫    |   🚫   |  ❌   |             ❌              |              ❌               |

## Accessibility

* Website applies high contrast theme when applicable.

## Running locally

See [this wiki page](https://github.com/Matriks404/mlc/wiki/Running-locally).

## Licensing terms

All of the original content is licensed under **CC BY-NC-SA 3.0** (compatible with [minecraft.wiki](https://minecraft.wiki/w/Minecraft_Wiki:Copyrights)) license.

The design of the interface is based on the [this diagram](https://minecraft.wiki/images/archive/20110915061258%21DataValuesBeta.png?2d45e&format=original) and the licensing for it applies.

Additionally this project uses in-game rendered **Minecraft** assets which are copyrighted by **[Mojang Studios](https://mojang.com)**, the terms of use for these assets can be found [here](https://www.minecraft.net/en-us/usage-guidelines#terms-brand_guidelines).



[^1]: Minecraft Alpha v1.2.3 wasn't tested yet.

[^2]: Applies to versions before Minecraft 1.13 snapshot 17w47a.

[^3]: Applies to versions after (and including) Minecraft 1.13 snapshot 17w47a.

[^4]: Minecraft Indev 0.31 versions: 20091231-2, 20100104 and 20100110 have unknown block renders and unknown item ID's.

[^5]: Minecraft Infdev versions: 20100227-2, 20100313, 20100316, 20100320 and 20100325 have unknown block/item renders.

[^6]: Minecraft Alpha v1.2.3_05 (But apparently meant to be v1.2.4, but is mislabeled) has a debugging feature enabled where only creepers spawn as hostile mobs, but it isn't tested what happens with existing or newly generated mob spawners in dungeons.
