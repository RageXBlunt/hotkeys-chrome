// Saves options to localStorage.
function save_options() {
    //hotkeys data structure
    function hotkey() {
        this.value = "";
        this.enabled = false;
    }
    var hotkeys =  new Object();
    //fill data structure
    var node_list = document.getElementsByTagName('input');
    for (var i = 0; i < node_list.length; i++) {
        var node = node_list[i];
        //check for duplicates
        for (var j = i + 1; j < node_list.length; j++) {
            var className = node.getAttribute('class');
            var className2 = node_list[j].getAttribute('class');
            if (node.value == node_list[j].value && node.getAttribute('type') == 'text' && (document.getElementById(className + "Enabled").checked && document.getElementById(className2 + "Enabled").checked)) {
                setStatus("Duplicates: <strong>" + node.getAttribute('class') + "<\/strong> and <strong>" + node_list[j].getAttribute('class') + "<\/strong>! Try again!", 10000);
                return;
            }
        }
        if (node.getAttribute('type') == 'text') {
            var className = node.getAttribute('class');
            hotkeys[className] =  new hotkey();
            hotkeys[className].value = node.value;
            hotkeys[className].enabled = document.getElementById(className + "Enabled").checked;
        }
    }
    //save data
    localStorage["hotkeys"] = JSON.stringify(hotkeys);
    localStorage["blocklist"] = document.getElementById("blocklist").value;
    //send new data over to background.html
    var port = chrome.extension.connect();
    port.postMessage( {
        action : "reloadSettings", data : hotkeys
    }
    );
    // Update status to let user know options were saved.
    setStatus("Options Saved.", 1500);
}
function setStatus(text, timeout) {
    var status = document.getElementById("status");
    status.innerHTML = text;
    setTimeout(function () {
        status.innerHTML = "";
    }
    , timeout);
}
// Restores data
function restore_options(arg) {
    //retrieve data from storage
    if (localStorage["hotkeys"]) {
        var hotkeys = JSON.parse(localStorage["hotkeys"]);
    }
    else {
        arg = "defaults";
    }
    if (localStorage["blocklist"]) {
        document.getElementById("blocklist").value = localStorage["blocklist"];
    }
    var node_list = document.getElementsByTagName('input');
    for (var i = 0; i < node_list.length; i++) {
        var node = node_list[i];
        if (node.getAttribute('type') == 'text') {
            var className = node.getAttribute('class');
            if (arg != "defaults") {
                //this assumes that both values are either filled, or undefined.
                node.value = hotkeys[className].value;
                document.getElementById(className + "Enabled").checked = hotkeys[className].enabled;
            }
            else {
                node.value = defaultHotkeys[className];
                document.getElementById(className + "Enabled").checked = true;
            }
        }
    }
    //refreshes all checkboxes
    $(function () {
        $("input:checkbox").button("refresh");
    }
    );
}

//add event listener
window.addEventListener('load', restore_options)