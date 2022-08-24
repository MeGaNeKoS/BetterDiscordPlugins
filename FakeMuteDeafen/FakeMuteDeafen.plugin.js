/**
 * @name Fake Mutes Deafen
 * @author MeGaNeKo
 * @description I didn't hear anything... I swear
 * @version 0.0.2
 * @updateUrl https://raw.githubusercontent.com/MeGaNeKoS/BetterDiscordPlugins/main/FakeMuteDeafen/FakeMuteDeafen.plugin.js
 */

module.exports = meta => {
    const mySettings = {
        mode: 0
    };
    const erlpack = DiscordNative.nativeModules.requireModule("discord_erlpack")

	
    if (WebSocket.prototype.original == undefined) {
        // store the original WebSocket
        WebSocket.prototype.original = WebSocket.prototype.send
    }

    WebSocket.prototype.send_modded = function(data) {
        const dataRaw = data
        try {
            if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
                let packed = new Uint8Array(data)
                let unpacked = erlpack.unpack(packed)

                if (unpacked.op == 4) {

                    if (unpacked.d.channel_id != null &&
                        unpacked.d.guild_id != null &&
                        unpacked.d.preferred_region != null) {
							
                        let t = {
                            "op": 4,
                            "d": {
                                "guild_id": unpacked.d.guild_id,
                                "channel_id": unpacked.d.channel_id,
                                "self_mute": mySettings.mode < 4 ? ["0", "1"].includes(mySettings.mode) : unpacked.d.self_mute, // mute deafen, mute only
                                "self_deaf": mySettings.mode < 4 ? ["0", "2"].includes(mySettings.mode) : unpacked.d.self_deaf, // mute deafen, deafen only
                                "self_video": unpacked.d.self_video,
                                "preferred_region": unpacked.d.preferred_region
                            }
                        }
                        data = erlpack.pack(t).buffer
                    }
                }
            }
            WebSocket.prototype.original.apply(this, [data]);
        } catch (err) {
            WebSocket.prototype.original.apply(this, [dataRaw]);
        }
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
        option1.text = "Mute + Deafen";
        input.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = 1;
        option2.text = "Mute only";
        input.appendChild(option2);

        const option3 = document.createElement("option");
        option3.value = 2;
        option3.text = "Deafen only";
        input.appendChild(option3);

        const option4 = document.createElement("option");
        option4.value = 3;
        option4.text = "Always open";
        input.appendChild(option4);

        const option5 = document.createElement("option");
        option5.value = 4;
        option5.text = "Normal";
        input.appendChild(option5);

        input.addEventListener("change", () => {
            mySettings["mode"] = input.value;
            BdApi.saveData("FakeMuteDeafen", "settings", mySettings);
        });
        for (const options of input.options) {
            if (options.value == mySettings.mode) {
                options.selected = "selected"
            }
            else {
                options.selected = ""
            }
        }
        setting.append(label, input);
        return setting;
    }

    return {
        start: () => {
            Object.assign(mySettings, BdApi.loadData("FakeMuteDeafen", "settings"));
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
