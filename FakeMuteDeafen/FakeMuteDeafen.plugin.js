/**
 * @name Fake Mutes/Deafen
 * @author MeGaNeKo
 * @description I didn't hear anything... I swear
 * @version 0.0.1
 * @updateUrl https://raw.githubusercontent.com/MeGaNeKoS/BetterDiscordPlugins/main/FakeMuteDeafen/FakeMuteDeafen.plugin.js
 */

const decoder = new TextDecoder("utf-8");

let app_mode = 0; // change how it stuck to. Valid value are 0 (deafen/mute), 1(deafen), 2(normal)
let last_channel = null // to avoid the discord reannounce status.

if (WebSocket.prototype.original == undefined) {
    // store the original WebSocket
    WebSocket.prototype.original = WebSocket.prototype.send
}

WebSocket.prototype.send_modded = function(data) {
    if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
        if (decoder.decode(data)
            .includes("guild_ids\u0003nil")) {
            // in here we are disconnect from vc
            last_channel = null
        }

        if (decoder.decode(data)
           .includes(last_channel)) {
            if (app_mode == 0) {
                // stuck on deafen/mute status
                if (decoder.decode(data)
                    .includes("self_mutes\u0005false") && decoder.decode(data)
                    .includes("self_deafs\u0005false")) {
                    return
                }
            }
            else if (app_mode == 1) {
                // stuck on deafen only
                if (decoder.decode(data)
                    .includes("self_deafs\u0005false")) {
						
                    return
                }
            }
            else if (app_mode == 2) {
                // normal
            }
        }
        if (decoder.decode(data)
            .includes("channel_idm\u0000\u0000\u0000")) {

            // we detect a voice channel in the data
            // store the new channel
            start = decoder.decode(data)
                .split("channel_idm\u0000\u0000\u0000")[1]
            end = start.split("\u0000\u0000\u0000	self_mutes")[0]
            last_channel = "channel_idm\u0000\u0000\u0000" + end + "\u0000\u0000\u0000	self_mutes"
        }

    }
    WebSocket.prototype.original.apply(this, [data]);
}

module.exports = class FakeMuteDeafen {
    constructor(meta) {
        const mySettings = {
			mode: 0
		}
		// app_mode = mySettings.mode
    }
	
    start() {
        WebSocket.prototype.send = WebSocket.prototype.send_modded
    }

    stop() {
        WebSocket.prototype.send = WebSocket.prototype.original
    }

    getSettingsPanel() {
		// dunno la, wont improve the UI unless someone help me. Dont have enough time for this
        const mySettingsPanel = document.createElement("div");
        mySettingsPanel.id = "my-settings";

        const buttonTextSetting = document.createElement("div");
        buttonTextSetting.classList.add("setting");

        const buttonTextLabel = document.createElement("span")
        buttonTextLabel.textContent = "Stuck on";

        const buttonTextInput = document.createElement("select");
        buttonTextInput.id = "buttonText";
		
		const option1 = document.createElement("option");
		option1.value = 0;
		option1.text = "Mute/Deafen";
		buttonTextInput.appendChild(option1);
		
		const option2 = document.createElement("option");
		option2.value = 1;
		option2.text = "Deafen";
		buttonTextInput.appendChild(option2);
		
		const option3 = document.createElement("option");
		option3.value = 2;
		option3.text = "Normal";
		buttonTextInput.appendChild(option3);
		buttonTextInput.addEventListener("change", () => {
			app_mode = buttonTextInput.value
			// save the config
		})
		for (const options of buttonTextInput.options){
			if (options.value == app_mode) {
				options.selected = "selected"
			} else {
				options.selected = ""
			}
		}
        buttonTextSetting.append(buttonTextLabel, buttonTextInput);
		
        mySettingsPanel.append(buttonTextSetting);

        return mySettingsPanel;
    }
}
