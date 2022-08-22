/**
 * @name Fake Mutes Deafen
 * @author MeGaNeKo
 * @description I didn't hear anything... I swear
 * @version 0.0.1
 * @updateUrl https://raw.githubusercontent.com/MeGaNeKoS/BetterDiscordPlugins/main/FakeMuteDeafen/FakeMuteDeafen.plugin.js
 */
module.exports = meta => {
    const mySettings = {
        mode: 0
    };
    const decoder = new TextDecoder("utf-8");

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
                if (mySettings.mode == 0) {
                    // stuck on deafen/mute status
                    if (decoder.decode(data)
                        .includes("self_mutes\u0005false") && decoder.decode(data)
                        .includes("self_deafs\u0005false")) {
                        return
                    }
                } else if (mySettings.mode == 1) {
                    // stuck on deafen only
                    if (decoder.decode(data)
                        .includes("self_deafs\u0005false")) {

                        return
                    }
                } else if (mySettings.mode == 2) {
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



    function buildSetting(text, key, type = () => {}) {
        const setting = Object.assign(document.createElement("div"), {
            className: "setting"
        });
        const label = Object.assign(document.createElement("span"), {
            textContent: text
        });
        const input = Object.assign(document.createElement("Select"), {
            id: type
        });
        const option1 = document.createElement("option");

        option1.value = 0;
        option1.text = "Mute/Deafen";
        input.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = 1;
        option2.text = "Deafen";
        input.appendChild(option2);

        const option3 = document.createElement("option");
        option3.value = 2;
        option3.text = "Normal";
        input.appendChild(option3);

        input.addEventListener("change", () => {
            mySettings["mode"] = input.value;
            BdApi.saveData("FakeMuteDeafen", "settings", mySettings);
        });
        for (const options of input.options) {
            if (options.value == mySettings.mode) {
                options.selected = "selected"
            } else {
                options.selected = ""
            }
        }
        setting.append(label, input);
        return setting;
    }

    return {
        start: () => {
            Object.assign(mySettings, BdApi.loadData("FakeMuteDeafen", "settings"));
            console.log(mySettings.mode)
            app_mode = mySettings.mode
            WebSocket.prototype.send = WebSocket.prototype.send_modded;
        },
        stop: () => {
            WebSocket.prototype.send = WebSocket.prototype.original;
        },
        getSettingsPanel: () => {
            const mySettingsPanel = document.createElement("div");
            mySettingsPanel.id = "my-settings";

            const buttonText = buildSetting("Stuck on", "buttonText", "text");

            mySettingsPanel.append(buttonText);
            return mySettingsPanel;
        }
    }

}
