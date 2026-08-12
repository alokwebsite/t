const fs = require('fs');
const path = require('path');

let WorkflowIntegration;
try {
    if (process.platform === 'darwin') {
        // Look in mac folder, fallback to root
        try { WorkflowIntegration = require('./mac/WorkflowIntegration.node'); } 
        catch(e) { WorkflowIntegration = require('./WorkflowIntegration.node'); }
    } else if (process.platform === 'linux') {
        // Look in linux folder, fallback to root
        try { WorkflowIntegration = require('./linux/WorkflowIntegration.node'); } 
        catch(e) { WorkflowIntegration = require('./WorkflowIntegration.node'); }
    } else {
        // Look in win folder, fallback to root
        try { WorkflowIntegration = require('./win/WorkflowIntegration.node'); } 
        catch(e) { WorkflowIntegration = require('./WorkflowIntegration.node'); }
    }
} catch(e) {
    console.error("Not running inside DaVinci Resolve, or WorkflowIntegration.node missing.");
}

let resolve = null;
if (WorkflowIntegration) {
    let isInitialized = WorkflowIntegration.Initialize("com.alok.autofileorganizerpro");
    if(isInitialized) resolve = WorkflowIntegration.GetResolve();
}

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Default Settings
let settings = {
    MIRROR_HARD_DRIVE: false,
    DEEP_SCAN_MASTER: false,
    ENABLE_CLIP_COLORS: true,
    ENABLE_FLAGS: false,
    BIN_RULES: [
        { bin: "📂 Video", exts: ["mp4","mov","hevc","avi","mkv","wmv","flv","webm","mpg","mpeg","m4v","3gp","ogv","mxf","dv","vob","ts","m2ts","r3d","ari","braw","cine","crm","lrv","asf","rm","divx","f4v","mts"] },
        { bin: "📂 Audio", exts: ["mp3","wav","aiff","aif","flac","m4a","ogg","opus","wma","caf","ac3","aac"] },
        { bin: "📂 Images", exts: ["jpg","jpeg","png","gif","bmp","tiff","tif","webp","heic","heif","svg","arw","cr2","cr3","nef","raf","rw2","orf","pef","dng","3fr","fff","gpr","srw","x3f","raw","insp"] },
        { bin: "📂 Documents", exts: ["pdf","txt","doc","docx","xml","csv","edl","aaf","fcpxml","json"] },
        { bin: "📂 SRT", exts: ["srt","vtt","dfxp"] },
        { bin: "📂 Sequences", exts: ["dpx","exr","tga","cin"] },
        { bin: "📂 Design", exts: ["psd","eps","ico","af","ai","afphoto","afdesign","afpub","sketch","xd"] }
    ],
    TYPE_RULES: [
        { bin: "📂 Timelines", types: ["Timeline", "Horizontal", "Vertical", "Square", "SD", "HD", "FHD", "2K", "4K", "8K", "23.976fps", "24fps", "25fps", "29.97fps", "30fps", "50fps", "59.94fps", "60fps"] },
        { bin: "📂 Compound Clips", types: ["Compound Clip", "Compound"] },
        { bin: "📂 Multicam", types: ["Multicam Clip", "Multicam"] },
        { bin: "📂 Photo Albums", types: ["Photo Album"] },
        { bin: "📂 Fusion", types: ["Fusion Clip", "Fusion", "Fusion Title", "Fusion Generator", "Fusion Composition", "Generator", "Adjustment Clip"] }
    ],
    BIN_MISC: "📂 Other Files",
    BIN_COLORS: {
        "📂 Video": "Purple", "📂 Audio": "Pink", "📂 Images": "Teal", "📂 Documents": "Yellow", 
        "📂 Sequences": "Green", "📂 Design": "Pink", "📂 Timelines": "Blue",
        "📂 Compound Clips": "Green", "📂 Fusion": "Orange", "📂 Other Files": "Orange",
        "Canon": "Orange", "Nikon": "Yellow", "Sony": "Orange", "Fujifilm": "Green", 
        "Panasonic": "Pink", "Olympus": "Teal", "Pentax": "Purple", "Leica": "Orange", 
        "GoPro": "Teal", "DJI": "Green", "Insta360": "Yellow", "Blackmagic": "Blue", "ARRI": "Orange",
        "RED": "Orange", "Z CAM": "Blue", "Kinefinity": "Orange", "Phantom": "Purple", "Hasselblad": "Yellow"
    },
    SFX_COLOR: "Beige",
    SFX_FLAG: "None",
    SFX_PATH: "",
    MUSIC_COLOR: "Pink",
    MUSIC_FLAG: "None",
    MUSIC_PATH: "",
    CUSTOM_MASTER_FOLDERS: [],
    BIN_FLAGS: {}
};

if (fs.existsSync(SETTINGS_FILE)) {
    try { 
        let loaded = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); 
        Object.assign(settings, loaded);
        if (settings.ENABLE_CLIP_COLORS === undefined) settings.ENABLE_CLIP_COLORS = true;
        if (settings.ENABLE_FLAGS === undefined) settings.ENABLE_FLAGS = false;
        if (settings.ANALYZE_TIMELINES === undefined) settings.ANALYZE_TIMELINES = false;
        if (settings.ANALYZE_TIMELINE_RES === undefined) settings.ANALYZE_TIMELINE_RES = false;
        if (settings.ANALYZE_TIMELINE_FPS === undefined) settings.ANALYZE_TIMELINE_FPS = false;
        if (settings.ORGANIZE_OFFLINE === undefined) settings.ORGANIZE_OFFLINE = false;
        if (!settings.BIN_FLAGS) settings.BIN_FLAGS = {};
        
        if (settings.TYPE_RULES) {
            settings.TYPE_RULES.forEach(tr => {
                if (tr.bin === "📂 Fusion Clips") tr.bin = "📂 Fusion";
            });
            
            if (!settings.TYPE_RULES.some(r => r.bin === "📂 Multicam")) {
                settings.TYPE_RULES.splice(2, 0, { bin: "📂 Multicam", types: ["Multicam Clip", "Multicam"] });
            }
            if (!settings.TYPE_RULES.some(r => r.bin === "📂 Photo Albums")) {
                settings.TYPE_RULES.splice(3, 0, { bin: "📂 Photo Albums", types: ["Photo Album", "PhotoAlbum", "Image Sequence", "Still Sequence"] });
            }
            
            let timelineRule = settings.TYPE_RULES.find(r => r.bin === "📂 Timelines");
            if (timelineRule) {
                let requiredTypes = ["Timeline", "Horizontal", "Vertical", "Square", "SD", "HD", "FHD", "2K", "4K", "8K", "23.976fps", "24fps", "25fps", "29.97fps", "30fps", "50fps", "59.94fps", "60fps"];
                requiredTypes.forEach(rt => {
                    if (!timelineRule.types.includes(rt)) timelineRule.types.push(rt);
                });
            }
        }
        
        if (settings.BIN_RULES) {
            settings.BIN_RULES = settings.BIN_RULES.filter(r => r.bin !== "📂 Multicam" && r.bin !== "📂 Photo Albums");
        }
        
        if (settings.BIN_COLORS && !settings.BIN_COLORS["iPhone"]) {
            settings.BIN_COLORS["iPhone"] = "Yellow";
        }
        
        if (settings.BIN_COLORS && settings.BIN_COLORS["📂 Fusion Clips"]) {
            settings.BIN_COLORS["📂 Fusion"] = settings.BIN_COLORS["📂 Fusion Clips"];
            delete settings.BIN_COLORS["📂 Fusion Clips"];
        }
        if (settings.BIN_FLAGS && settings.BIN_FLAGS["📂 Fusion Clips"]) {
            settings.BIN_FLAGS["📂 Fusion"] = settings.BIN_FLAGS["📂 Fusion Clips"];
            delete settings.BIN_FLAGS["📂 Fusion Clips"];
        }
        saveSettings();
    } catch(e){}
}
function saveSettings() {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch(e) {
        console.error("Failed to save settings: ", e);
    }
}

// Set initial compact window size
try {
    window.resizeTo(500, 370);
} catch(e) {}

document.getElementById('btn-open-settings').addEventListener('click', () => {
    try { window.resizeTo(650, 800); } catch(e) {}
    document.getElementById('settings-card').style.display = 'block';
    document.getElementById('organize-card').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    renderSettings();
});

document.getElementById('btn-cancel').addEventListener('click', () => {
    try { window.resizeTo(500, 370); } catch(e) {}
    document.getElementById('settings-card').style.display = 'none';
    document.getElementById('organize-card').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    
    // Discard any unsaved changes (like from a Reset) by reloading from disk
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            let loaded = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); 
            Object.assign(settings, loaded);
        }
    } catch(e) {}
});


if (document.getElementById('toggle-offline-files')) {
    document.getElementById('toggle-offline-files').checked = settings.ORGANIZE_OFFLINE === true;
    document.getElementById('toggle-offline-files').addEventListener('change', (e) => {
        settings.ORGANIZE_OFFLINE = e.target.checked;
        saveSettings();
    });
}

// Render Settings rows
const colors = ["None", "Orange", "Apricot", "Yellow", "Lime", "Olive", "Green", "Teal", "Navy", "Blue", "Purple", "Violet", "Pink", "Tan", "Beige", "Brown", "Chocolate"];

// Sanitize settings to ensure compatibility with all DaVinci Resolve versions
const colorMap = {
    "Red": "Orange", "Cyan": "Teal", "Apple": "Olive", "Forest": "Green",
    "Fuchsia": "Pink", "Rose": "Pink", "Mint": "Lime", "Lemon": "Yellow",
    "Sand": "Tan", "Cocoa": "Brown"
};
function sanitizeColor(c) {
    if(!c) return "None";
    if(colorMap[c]) return colorMap[c];
    if(colors.includes(c)) return c;
    return "None";
}
if (settings.BIN_COLORS) {
    for (let key in settings.BIN_COLORS) {
        settings.BIN_COLORS[key] = sanitizeColor(settings.BIN_COLORS[key]);
    }
}
settings.SFX_COLOR = sanitizeColor(settings.SFX_COLOR);
settings.MUSIC_COLOR = sanitizeColor(settings.MUSIC_COLOR);
if (settings.CUSTOM_MASTER_FOLDERS) {
    settings.CUSTOM_MASTER_FOLDERS.forEach(m => m.color = sanitizeColor(m.color));
}

// DaVinci Resolve UI hex colors mapping
const hexColors = {
    "None": "transparent",
    "Orange": "#F27A23",
    "Apricot": "#F4B34A",
    "Yellow": "#D6B538",
    "Lime": "#A4B634",
    "Olive": "#5D752A",
    "Green": "#458C5A",
    "Teal": "#22867F",
    "Navy": "#1B5D88",
    "Blue": "#4F85B3",
    "Purple": "#856191",
    "Violet": "#D75A83",
    "Pink": "#E889A1",
    "Tan": "#BCA389",
    "Beige": "#BD9F7B",
    "Brown": "#83531F",
    "Chocolate": "#815143"
};

const flagHexColors = {
    "None": "transparent",
    "Blue": "#3477D8",
    "Cyan": "#34B5D8",
    "Green": "#4EA13E",
    "Yellow": "#D6B538",
    "Red": "#C63C3C",
    "Pink": "#E889A1",
    "Purple": "#856191",
    "Fuchsia": "#C83498",
    "Rose": "#E26D6D",
    "Lavender": "#9783C8",
    "Sky": "#70A5E0",
    "Mint": "#60B27A",
    "Lemon": "#C5C946",
    "Sand": "#B8A066",
    "Cocoa": "#75553E",
    "Cream": "#E8DCCA"
};

function createColorPicker(initialValue, className, datasetKey, datasetValue, colorMap = hexColors) {
    let container = document.createElement('div');
    container.className = `custom-color-picker ${className}`;
    if (datasetKey) container.dataset[datasetKey] = datasetValue;
    
    if (className.includes('clip-color-picker')) {
        container.style.display = settings.ENABLE_CLIP_COLORS ? 'inline-block' : 'none';
    }
    if (className.includes('flag-color-picker')) {
        container.style.display = settings.ENABLE_FLAGS ? 'inline-block' : 'none';
    }

    let preview = document.createElement('div');
    preview.className = 'ccp-preview';
    if (className.includes('flag-color-picker')) {
        preview.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(0,0,0,0.5);"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>';
        preview.style.display = 'flex';
        preview.style.alignItems = 'center';
        preview.style.justifyContent = 'center';
    }
    container.appendChild(preview);

    let menu = document.createElement('div');
    menu.className = 'ccp-menu';

    let currentValue = initialValue || "None";

    Object.defineProperty(container, 'value', {
        get: () => currentValue,
        set: (v) => {
            currentValue = v;
            updatePreview(v);
            updateSelected(v);
        }
    });

    function updatePreview(val) {
        preview.style.backgroundColor = colorMap[val] || "transparent";
        if (val === "None") preview.classList.add('none-color');
        else preview.classList.remove('none-color');
    }

    Object.keys(colorMap).forEach(c => {
        let opt = document.createElement('div');
        opt.className = 'ccp-option';
        
        let label = document.createElement('span');
        label.className = 'ccp-label';
        label.innerText = c;
        label.style.flex = "1";
        label.style.textAlign = "left";
        label.style.fontSize = "12px";
        label.style.color = "#E8E8E8";
        
        let circle = document.createElement('div');
        circle.className = 'ccp-circle';
        circle.style.backgroundColor = colorMap[c] || "transparent";
        if (c === "None") circle.classList.add('none-color');
        
        if (className.includes('flag-color-picker')) {
            circle.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(0,0,0,0.4);"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>';
            circle.style.display = 'flex';
            circle.style.alignItems = 'center';
            circle.style.justifyContent = 'center';
        }
        
        opt.appendChild(label);
        opt.appendChild(circle);

        opt.onclick = (e) => {
            e.stopPropagation();
            container.value = c;
            menu.style.display = 'none';
            container.dispatchEvent(new Event('change', { bubbles: true }));
        };
        menu.appendChild(opt);
    });

    function updateSelected(val) {
        let keys = Object.keys(colorMap);
        Array.from(menu.children).forEach((opt, idx) => {
            if (keys[idx] === val) opt.classList.add('selected');
            else opt.classList.remove('selected');
        });
    }

    preview.onclick = (e) => {
        e.stopPropagation();
        let isShowing = menu.style.display === 'block';
        document.querySelectorAll('.ccp-menu').forEach(m => m.style.display = 'none');
        menu.style.display = isShowing ? 'none' : 'block';
    };

    container.appendChild(menu);
    container.value = currentValue; // Initialize

    return container;
}

// Global click to close menus
document.addEventListener('click', () => {
    document.querySelectorAll('.ccp-menu').forEach(m => m.style.display = 'none');
});

function createCustomMasterBlock(type, initialPath, initialColor, initialDeepScan = true, initialNoSound = false) {
    let group = document.createElement('div');
    group.className = 'setting-group custom-master-group';
    group.dataset.name = type;
    
    let flexDiv = document.createElement('div');
    flexDiv.style.display = 'flex';
    flexDiv.style.gap = '8px';
    flexDiv.style.alignItems = 'center';
    
    let nameLbl = document.createElement('div');
    nameLbl.innerHTML = type;
    nameLbl.style.fontSize = '12px';
    nameLbl.style.color = 'var(--text-dim)';
    nameLbl.style.fontWeight = '600';
    nameLbl.style.width = '80px';
    nameLbl.style.overflow = 'hidden';
    nameLbl.style.textOverflow = 'ellipsis';
    
    let dsSwitch = document.createElement('label');
    dsSwitch.className = 'mini-switch';
    let dsToggle = document.createElement('input');
    dsToggle.type = 'checkbox';
    dsToggle.className = 'custom-master-deep-scan-toggle';
    dsToggle.checked = initialDeepScan;
    
    // Add event listener to re-render preview when deep scan is toggled
    dsToggle.addEventListener('change', () => {
        let pathInp = group.querySelector('.custom-master-path-inp');
        if (pathInp) pathInp.dispatchEvent(new Event('input'));
    });
    
    let dsSlider = document.createElement('span');
    dsSlider.className = 'mini-slider';
    dsSwitch.appendChild(dsToggle);
    dsSwitch.appendChild(dsSlider);
    
    let dsWrapper = document.createElement('div');
    dsWrapper.style.display = 'flex';
    dsWrapper.style.alignItems = 'center';
    dsWrapper.style.gap = '4px';
    dsWrapper.style.fontSize = '9px';
    dsWrapper.style.color = 'var(--text-dim)';
    dsWrapper.innerHTML = 'Deep Scan';
    dsWrapper.appendChild(dsSwitch);
    
    let nsSwitch = document.createElement('label');
    nsSwitch.className = 'mini-switch';
    let nsToggle = document.createElement('input');
    nsToggle.type = 'checkbox';
    nsToggle.className = 'custom-master-no-sound-toggle';
    nsToggle.checked = initialNoSound;
    
    let nsSlider = document.createElement('span');
    nsSlider.className = 'mini-slider';
    nsSwitch.appendChild(nsToggle);
    nsSwitch.appendChild(nsSlider);
    
    let nsWrapper = document.createElement('div');
    nsWrapper.style.display = 'flex';
    nsWrapper.style.alignItems = 'center';
    nsWrapper.style.gap = '4px';
    nsWrapper.style.fontSize = '9px';
    nsWrapper.style.color = 'var(--text-dim)';
    nsWrapper.innerHTML = 'No Sound';
    nsWrapper.appendChild(nsSwitch);
    
    let togglesFlex = document.createElement('div');
    togglesFlex.style.display = 'flex';
    togglesFlex.style.alignItems = 'center';
    togglesFlex.style.gap = '15px';
    togglesFlex.style.marginLeft = 'auto';
    togglesFlex.appendChild(nsWrapper);
    togglesFlex.appendChild(dsWrapper);
    
    let headerFlex = document.createElement('div');
    headerFlex.style.display = 'flex';
    headerFlex.style.justifyContent = 'space-between';
    headerFlex.style.alignItems = 'center';
    headerFlex.appendChild(nameLbl);
    headerFlex.appendChild(togglesFlex);
    
    let pathInp = document.createElement('input');
    pathInp.className = 'custom-master-path-inp';
    pathInp.value = initialPath || "";
    pathInp.placeholder = "Master Folder Path";
    pathInp.style.flex = '1';
    pathInp.style.background = 'var(--bg-card)';
    pathInp.style.border = '1px solid var(--border)';
    pathInp.style.color = 'white';
    pathInp.style.padding = '8px 10px';
    pathInp.style.borderRadius = '4px';
    pathInp.style.fontSize = '12px';
    pathInp.style.outline = 'none';
    
    let browseBtn = document.createElement('button');
    browseBtn.innerHTML = '📁 Browse';
    browseBtn.style.background = 'var(--bg-dark)';
    browseBtn.style.border = '1px solid var(--border)';
    browseBtn.style.color = 'white';
    browseBtn.style.padding = '7px 10px';
    browseBtn.style.borderRadius = '4px';
    browseBtn.style.cursor = 'pointer';
    browseBtn.style.fontSize = '12px';
    browseBtn.style.outline = 'none';
    
    browseBtn.onclick = () => {
        const { execSync } = require('child_process');
        try {
            let res = "";
            if (process.platform === 'darwin') {
                let cmd = `osascript -e 'tell application "Finder" to POSIX path of (choose folder with prompt "Select Master ${type} Folder")'`;
                res = execSync(cmd).toString().trim();
            } else if (process.platform === 'linux') {
                try {
                    res = execSync(`zenity --file-selection --directory --title="Select Master ${type} Folder"`).toString().trim();
                } catch(e) {
                    try { res = execSync(`kdialog --getexistingdirectory / --title "Select Master ${type} Folder"`).toString().trim(); }
                    catch(e2) { console.error("No supported dialog tool found on Linux."); }
                }
            } else {
                let cmd = `powershell -WindowStyle Hidden -STA -Command "Add-Type -AssemblyName System.windows.forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Title = 'Select Master ${type} Folder'; $f.ValidateNames = $false; $f.CheckFileExists = $false; $f.CheckPathExists = $true; $f.FileName = 'Select_Folder_Here'; $res = $f.ShowDialog(); if($res -eq 'OK'){ Split-Path $f.FileName }"`;
                res = execSync(cmd).toString().trim();
            }
            if(res) {
                pathInp.value = res;
                let evt = new Event('input');
                pathInp.dispatchEvent(evt);
                
                let newFolderName = res.split(/[\\/]/).filter(p=>p).pop();
                if(newFolderName) {
                    nameLbl.innerHTML = newFolderName;
                    group.dataset.name = newFolderName;
                }
            }
        } catch(e) {}
    };
    
    let colSel = createColorPicker(initialColor || "Pink", "clip-color-picker custom-master-color-sel");
    let flagSel = createColorPicker(settings.BIN_FLAGS[type] || "None", "flag-color-picker custom-master-flag-sel", null, null, flagHexColors);
    let flexColor = document.createElement('div');
    flexColor.style.display = 'flex'; flexColor.style.gap = '5px';
    flexColor.appendChild(colSel); flexColor.appendChild(flagSel);
    
    let delBtn = document.createElement('button');
    delBtn.innerHTML = '✖';
    delBtn.style.background = 'transparent';
    delBtn.style.border = 'none';
    delBtn.style.color = '#ff5555';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = () => group.remove();
    
    let wrapperDiv = document.createElement('div');
    wrapperDiv.style.display = 'flex';
    wrapperDiv.style.flexDirection = 'column';
    wrapperDiv.style.width = '100%';
    
    let subfolderPreview = document.createElement('div');
    subfolderPreview.style.width = '100%';
    subfolderPreview.style.marginTop = '10px';
    subfolderPreview.style.fontSize = '10px';
    
    const updatePreview = (val) => {
        subfolderPreview.innerHTML = '';
        if(!val || val.trim() === "") return;
        try {
            if(fs.existsSync(val)) {
                const path = require('path');
                let isDeep = dsToggle.checked;
                let items = fs.readdirSync(val, {withFileTypes: true, recursive: isDeep});
                let tree = buildFolderTree(items, val);
                let topLevels = Object.keys(tree).sort();
                
                if(topLevels.length > 0) {
                    let masterDetails = document.createElement('details');
                    masterDetails.className = 'master-accordion';
                    masterDetails.open = false;
                    
                    masterDetails.addEventListener('toggle', () => {
                        if (masterDetails.open) {
                            document.querySelectorAll('.master-accordion').forEach(other => {
                                if (other !== masterDetails && other.open) {
                                    other.open = false;
                                }
                            });
                        }
                    });
                    
                    let masterSummary = document.createElement('summary');
                    masterSummary.style.display = 'flex';
                    masterSummary.style.justifyContent = 'space-between';
                    masterSummary.style.alignItems = 'center';
                    masterSummary.style.marginBottom = '8px';
                    masterSummary.style.padding = '5px';
                    masterSummary.style.cursor = 'pointer';
                    masterSummary.style.background = 'var(--bg)';
                    masterSummary.style.borderRadius = '4px';
                    masterSummary.style.outline = 'none';
                    masterSummary.style.userSelect = 'none';
                    
                    let countLbl = document.createElement('span');
                    countLbl.innerHTML = `▶ Found ${topLevels.length} main folders`;
                    countLbl.style.fontSize = '12px';
                    countLbl.style.fontWeight = 'bold';
                    countLbl.style.color = 'var(--text-dim)';
                    
                    masterDetails.addEventListener('toggle', () => {
                        countLbl.innerHTML = (masterDetails.open ? '▼ ' : '▶ ') + `Found ${topLevels.length} main folders`;
                    });
                    
                    let toggleAllBtn = document.createElement('button');
                    toggleAllBtn.innerHTML = 'Expand All';
                    toggleAllBtn.style.fontSize = '10px';
                    toggleAllBtn.style.padding = '3px 8px';
                    toggleAllBtn.style.background = 'var(--bg-dark)';
                    toggleAllBtn.style.border = '1px solid var(--border)';
                    toggleAllBtn.style.color = 'white';
                    toggleAllBtn.style.borderRadius = '4px';
                    toggleAllBtn.style.cursor = 'pointer';
                    
                    toggleAllBtn.onclick = (e) => {
                        e.stopPropagation();
                        let isExpand = toggleAllBtn.innerHTML === 'Expand All';
                        masterDetails.querySelectorAll('details').forEach(d => {
                            if (d !== masterDetails) {
                                let st = d.querySelector('.summ-title-text');
                                if (st && st.dataset.expandable === 'true') {
                                    d.open = isExpand;
                                    st.innerHTML = (isExpand ? '▼ ' : '▶ ') + st.dataset.name;
                                }
                            }
                        });
                        toggleAllBtn.innerHTML = isExpand ? 'Collapse All' : 'Expand All';
                    };
                    
                    masterSummary.appendChild(countLbl);
                    masterSummary.appendChild(toggleAllBtn);
                    masterDetails.appendChild(masterSummary);
                    
                    let foldersContainer = document.createElement('div');
                    renderFolderTree(tree, foldersContainer, "custom-master");
                    
                    masterDetails.appendChild(foldersContainer);
                    subfolderPreview.appendChild(masterDetails);
                } else {
                    subfolderPreview.innerHTML = '<span style="color:var(--text-dim)">No subfolders found.</span>';
                }
            } else {
                subfolderPreview.innerHTML = '<span style="color:#ff5555">Path does not exist!</span>';
            }
        } catch(e) {}
    };
    
    pathInp.addEventListener('input', (e) => updatePreview(e.target.value));
    updatePreview(initialPath);
    
    flexDiv.appendChild(pathInp);
    flexDiv.appendChild(browseBtn);
    flexDiv.appendChild(flexColor);
    flexDiv.appendChild(delBtn);
    
    wrapperDiv.appendChild(headerFlex);
    wrapperDiv.appendChild(flexDiv);
    wrapperDiv.appendChild(subfolderPreview);
    
    group.appendChild(wrapperDiv);
    return group;
}

function createRow(binName, extsStr, color, isTypeRule = false, isDeletable = true, isIgnoreRule = false) {
    let div = document.createElement('div');
    div.className = 'accordion-item';
    if(isTypeRule) div.dataset.isTypeRule = "true";
    
    let header = document.createElement('div');
    header.className = 'accordion-header';
    
    let toggle = document.createElement('span');
    toggle.className = 'toggle-icon';
    toggle.innerHTML = '▶';
    
    let nameWrap = document.createElement('div');
    nameWrap.style.display = 'flex';
    nameWrap.style.alignItems = 'center';
    nameWrap.style.position = 'relative';
    nameWrap.style.flex = '1';
    
    let nameInp = document.createElement('input');
    nameInp.className = 'folder-name';
    nameInp.value = binName;
    nameInp.placeholder = "Folder Name";
    nameInp.readOnly = true;
    nameInp.style.width = '100%';
    nameInp.style.paddingRight = '25px';
    nameInp.style.cursor = 'pointer';
    
    let penBtn = document.createElement('span');
    penBtn.innerHTML = '✏️';
    penBtn.style.position = 'absolute';
    penBtn.style.right = '8px';
    penBtn.style.cursor = 'pointer';
    penBtn.style.fontSize = '12px';
    penBtn.style.opacity = '0.7';
    
    penBtn.onclick = (e) => {
        e.stopPropagation();
        nameInp.readOnly = false;
        nameInp.style.cursor = 'text';
        nameInp.focus();
    };
    
    nameInp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nameInp.blur();
        }
    });
    
    nameInp.dataset.oldVal = nameInp.value;
    nameInp.onblur = () => {
        let val = nameInp.value.trim();
        if (val && !val.startsWith("📂")) {
            val = "📂 " + val;
        } else if (val && val.startsWith("📂") && !val.startsWith("📂 ")) {
            val = val.replace("📂", "📂 ");
        }
        
        if (val && val !== nameInp.dataset.oldVal) {
            let list = document.getElementById('settings-list');
            let existingNames = Array.from(list.querySelectorAll('.folder-name'))
                                     .filter(inp => inp !== nameInp)
                                     .map(inp => inp.value.trim());
            
            let baseVal = val;
            let counter = 1;
            while (existingNames.includes(val)) {
                let suffix = counter < 10 ? "0" + counter : counter;
                val = baseVal + "_" + suffix;
                counter++;
            }
        }
        
        if (val) {
            nameInp.value = val;
            nameInp.dataset.oldVal = val;
        }
        nameInp.readOnly = true;
        nameInp.style.cursor = 'pointer';
    };
    
    nameWrap.appendChild(nameInp);
    nameWrap.appendChild(penBtn);
    
    let flexColor = document.createElement('div');
    flexColor.style.display = 'flex'; flexColor.style.gap = '5px';
    if (!isIgnoreRule) {
        let colorSel = createColorPicker(color, "clip-color-picker accordion-color-sel");
        let flagSel = createColorPicker(settings.BIN_FLAGS[binName] || "None", "flag-color-picker accordion-flag-sel", null, null, flagHexColors);
        flexColor.appendChild(colorSel); flexColor.appendChild(flagSel);
    }
    
    let delBtn = document.createElement('button');
    delBtn.className = 'btn-del';
    delBtn.innerHTML = '✖';
    delBtn.onclick = (e) => { e.stopPropagation(); div.remove(); };
    
    header.appendChild(toggle);
    header.appendChild(nameWrap);
    header.appendChild(flexColor);
    if (isDeletable) {
        header.appendChild(delBtn);
    } else {
        let pad = document.createElement('div');
        pad.style.width = '14px';
        header.appendChild(pad);
    }
    
    // Toggle accordion logic
    header.onclick = (e) => {
        if (e.target === nameInp && !nameInp.readOnly) return;
        if ((!isIgnoreRule && e.target.classList.contains('clip-color-picker')) || e.target === delBtn || e.target === penBtn) return;
        
        let wasExpanded = div.classList.contains('expanded');
        
        // Collapse all others
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('expanded');
        });
        
        // Toggle this one
        if (!wasExpanded) {
            div.classList.add('expanded');
        }
    };
    
    let body = document.createElement('div');
    body.className = 'accordion-body';
    
    let extGroup = document.createElement('div');
    extGroup.className = 'setting-group';
    let isItemType = isTypeRule;
    
    let titleFlex = document.createElement('div');
    titleFlex.style.display = 'flex';
    titleFlex.style.justifyContent = 'space-between';
    titleFlex.style.alignItems = 'center';
    
    let extLbl = document.createElement('label');
    if (isIgnoreRule) {
        extLbl.innerHTML = "MAIN FOLDERS";
    } else if (isItemType) {
        extLbl.innerHTML = "Item Types (Locked)";
    } else {
        extLbl.innerHTML = "FILE EXTENSIONS";
    }
    titleFlex.appendChild(extLbl);

    let useExtToggle;
    let extGrid = document.createElement('div');
    extGrid.className = 'ext-grid';

    if (!isItemType && !isIgnoreRule) {
        let switchLabel = document.createElement('label');
        switchLabel.className = 'mini-switch';
        switchLabel.style.marginLeft = '5px';

        useExtToggle = document.createElement('input');
        useExtToggle.type = 'checkbox';
        useExtToggle.className = 'use-ext-toggle';
        
        // Find existing setting
        let r = settings.BIN_RULES.find(r => r.bin === binName);
        useExtToggle.checked = (r && r.useExt === false) ? false : true;
        
        let slider = document.createElement('span');
        slider.className = 'mini-slider';

        switchLabel.appendChild(useExtToggle);
        switchLabel.appendChild(slider);
        
        let toggleLbl = document.createElement('div');
        toggleLbl.style.fontSize = '11px';
        toggleLbl.style.display = 'flex';
        toggleLbl.style.alignItems = 'center';
        toggleLbl.style.gap = '4px';
        toggleLbl.style.color = 'var(--text-dim)';
        toggleLbl.style.margin = '0';
        toggleLbl.style.userSelect = 'none';
        
        toggleLbl.appendChild(document.createTextNode("Use File Extensions"));
        toggleLbl.appendChild(switchLabel);
          
          let currentExtColor = r && r.extColor ? r.extColor : "None";
          let extColorBtn = createColorPicker(currentExtColor, "clip-color-picker ext-color-btn", "bin", binName);
          // Adjust position/margin for it to look good next to toggle
          extColorBtn.style.marginLeft = "10px";
          toggleLbl.appendChild(extColorBtn);

          titleFlex.appendChild(toggleLbl);
        
        useExtToggle.onchange = () => {
            extGrid.style.opacity = useExtToggle.checked ? '1' : '0.5';
            extGrid.style.pointerEvents = useExtToggle.checked ? 'auto' : 'none';
        };
        // Trigger initial state
        extGrid.style.opacity = useExtToggle.checked ? '1' : '0.5';
        extGrid.style.pointerEvents = useExtToggle.checked ? 'auto' : 'none';
    } else if (isItemType && binName.includes("Timelines")) {
        let togglesWrapper = document.createElement('div');
        togglesWrapper.style.display = 'flex';
        togglesWrapper.style.gap = '15px';

        let switchLabelSize = document.createElement('label');
        switchLabelSize.className = 'mini-switch';
        switchLabelSize.style.marginLeft = '5px';

        let analyzeToggleSize = document.createElement('input');
        analyzeToggleSize.type = 'checkbox';
        analyzeToggleSize.className = 'analyze-timeline-toggle';
        analyzeToggleSize.checked = settings.ANALYZE_TIMELINES;
        
        let sliderSize = document.createElement('span');
        sliderSize.className = 'mini-slider';

        switchLabelSize.appendChild(analyzeToggleSize);
        switchLabelSize.appendChild(sliderSize);
        
        let toggleLblSize = document.createElement('div');
        toggleLblSize.style.fontSize = '11px';
        toggleLblSize.style.display = 'flex';
        toggleLblSize.style.alignItems = 'center';
        toggleLblSize.style.gap = '4px';
        toggleLblSize.style.color = 'var(--text-dim)';
        toggleLblSize.style.userSelect = 'none';
        
        toggleLblSize.appendChild(document.createTextNode("Size"));
        toggleLblSize.appendChild(switchLabelSize);

        let switchLabelRes = document.createElement('label');
        switchLabelRes.className = 'mini-switch';
        switchLabelRes.style.marginLeft = '5px';

        let analyzeToggleRes = document.createElement('input');
        analyzeToggleRes.type = 'checkbox';
        analyzeToggleRes.className = 'analyze-timeline-res-toggle';
        analyzeToggleRes.checked = settings.ANALYZE_TIMELINE_RES;
        
        let sliderRes = document.createElement('span');
        sliderRes.className = 'mini-slider';

        switchLabelRes.appendChild(analyzeToggleRes);
        switchLabelRes.appendChild(sliderRes);
        
        let toggleLblRes = document.createElement('div');
        toggleLblRes.style.fontSize = '11px';
        toggleLblRes.style.display = 'flex';
        toggleLblRes.style.alignItems = 'center';
        toggleLblRes.style.gap = '4px';
        toggleLblRes.style.color = 'var(--text-dim)';
        toggleLblRes.style.userSelect = 'none';
        
        toggleLblRes.appendChild(document.createTextNode("Resolution"));
        toggleLblRes.appendChild(switchLabelRes);

        let switchLabelFps = document.createElement('label');
        switchLabelFps.className = 'mini-switch';
        switchLabelFps.style.marginLeft = '5px';

        let analyzeToggleFps = document.createElement('input');
        analyzeToggleFps.type = 'checkbox';
        analyzeToggleFps.className = 'analyze-timeline-fps-toggle';
        analyzeToggleFps.checked = settings.ANALYZE_TIMELINE_FPS;
        
        let sliderFps = document.createElement('span');
        sliderFps.className = 'mini-slider';

        switchLabelFps.appendChild(analyzeToggleFps);
        switchLabelFps.appendChild(sliderFps);
        
        let toggleLblFps = document.createElement('div');
        toggleLblFps.style.fontSize = '11px';
        toggleLblFps.style.display = 'flex';
        toggleLblFps.style.alignItems = 'center';
        toggleLblFps.style.gap = '4px';
        toggleLblFps.style.color = 'var(--text-dim)';
        toggleLblFps.style.userSelect = 'none';
        
        toggleLblFps.appendChild(document.createTextNode("Framerate"));
        toggleLblFps.appendChild(switchLabelFps);

        togglesWrapper.appendChild(toggleLblSize);
        togglesWrapper.appendChild(toggleLblRes);
        togglesWrapper.appendChild(toggleLblFps);
        titleFlex.appendChild(togglesWrapper);
    }
    
    extGroup.appendChild(titleFlex);
    
    let arr = extsStr.split(',').map(s=>s.trim()).filter(s=>s.length>0);
    arr.forEach(ext => {
        let tag = document.createElement('div');
        tag.className = 'ext-tag';
        if (isItemType) {
            tag.innerHTML = `<span>${ext}</span>`;
            tag.style.paddingRight = "10px";
            tag.style.cursor = "default";
            tag.style.opacity = "0.7";
        } else {
            let isLocked = false;
            if (binName.trim() === "📂 SRT" && ["srt", "vtt", "dfxp"].includes(ext.toLowerCase())) {
                isLocked = true;
            }
            if (isLocked) {
                tag.innerHTML = `<span>${ext}</span>`;
                tag.style.paddingRight = "10px";
            } else {
                tag.innerHTML = `<span>${ext}</span><button class="del-ext">✖</button>`;
                tag.querySelector('.del-ext').onclick = () => tag.remove();
            }
        }
        extGrid.appendChild(tag);
    });
    
    if (!isItemType) {
        let addDiv = document.createElement('div');
        addDiv.className = 'ext-add';
        let addInp = document.createElement('input');
        addInp.placeholder = "+ add";
        addInp.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                let v = addInp.value.trim();
                if(v) {
                    let tag = document.createElement('div');
                    tag.className = 'ext-tag';
                    tag.innerHTML = `<span>${v}</span><button class="del-ext">✖</button>`;
                    tag.querySelector('.del-ext').onclick = () => tag.remove();
                    extGrid.insertBefore(tag, addDiv);
                    addInp.value = "";
                }
            }
        });
        addDiv.appendChild(addInp);
        extGrid.appendChild(addDiv);
    }
    
    extGroup.appendChild(extGrid);
    body.appendChild(extGroup);
    
    if (binName !== "📂 SRT") {
        let prefixGroup = document.createElement('div');
        prefixGroup.className = 'setting-group';
        
        let pTitleFlex = document.createElement('div');
        pTitleFlex.style.display = 'flex';
        pTitleFlex.style.justifyContent = 'space-between';
        pTitleFlex.style.alignItems = 'center';
        
        let pLbl = document.createElement('label');
        pLbl.innerHTML = isIgnoreRule ? "NAME PREFIXES" : "Name Prefixes";
        pTitleFlex.appendChild(pLbl);
        
        prefixGroup.appendChild(pTitleFlex);
        
        let usePrefixToggle; // hoisted so we can reference it below if needed
        let prefGrid = document.createElement('div');
        prefGrid.className = 'ext-grid prefix-grid';
        prefGrid.style.marginTop = '8px';

        if (!isIgnoreRule) {
            let pToggleLbl = document.createElement('div');
            pToggleLbl.style.fontSize = '11px';
            pToggleLbl.style.display = 'flex';
            pToggleLbl.style.alignItems = 'center';
            pToggleLbl.style.gap = '4px';
            pToggleLbl.style.margin = '0';
            pToggleLbl.style.userSelect = 'none';
            
            let pSwitchLabel = document.createElement('label');
            pSwitchLabel.className = 'mini-switch';
            pSwitchLabel.style.marginLeft = '5px';
            
            usePrefixToggle = document.createElement('input');
            usePrefixToggle.type = 'checkbox';
            usePrefixToggle.className = 'use-prefix-toggle';
            let r = settings.BIN_RULES.find(r => r.bin === binName) || settings.TYPE_RULES.find(r => r.bin === binName);
            usePrefixToggle.checked = (r && r.usePrefixes === false) ? false : true;
            
            let pSlider = document.createElement('span');
            pSlider.className = 'mini-slider';
            
            pSwitchLabel.appendChild(usePrefixToggle);
            pSwitchLabel.appendChild(pSlider);
            
            let currentPrefColor = r && r.prefixColor ? r.prefixColor : "None";
            let prefColorBtn = createColorPicker(currentPrefColor, "clip-color-picker prefix-color-btn", "bin", binName);
            prefColorBtn.style.marginLeft = "10px";
            
            pToggleLbl.appendChild(document.createTextNode("Use Name Prefixes"));
            pToggleLbl.appendChild(pSwitchLabel);
            pToggleLbl.appendChild(prefColorBtn);
            pTitleFlex.appendChild(pToggleLbl);
            
            usePrefixToggle.onchange = () => {
                prefGrid.style.opacity = usePrefixToggle.checked ? '1' : '0.5';
                prefGrid.style.pointerEvents = usePrefixToggle.checked ? 'auto' : 'none';
            };
            prefGrid.style.opacity = usePrefixToggle.checked ? '1' : '0.5';
            prefGrid.style.pointerEvents = usePrefixToggle.checked ? 'auto' : 'none';
        }
        
        r = settings.BIN_RULES.find(r => r.bin === binName) || settings.TYPE_RULES.find(r => r.bin === binName);
        let prefArr = [];
        if (isIgnoreRule) {
            prefArr = settings.IGNORE_CLIPS || [];
        } else {
            prefArr = (r && r.prefixes) ? r.prefixes : [];
        }
        prefArr.forEach(pref => {
            let tag = document.createElement('div');
            tag.className = 'ext-tag prefix-tag';
            tag.innerHTML = `<span>${pref}</span><button class="del-ext">✖</button>`;
            tag.querySelector('.del-ext').onclick = () => tag.remove();
            prefGrid.appendChild(tag);
        });
        
        let addPrefDiv = document.createElement('div');
        addPrefDiv.className = 'ext-add';
        let addPrefInp = document.createElement('input');
        addPrefInp.type = 'text';
        addPrefInp.placeholder = '+ add prefix';
        addPrefInp.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                let v = addPrefInp.value.trim();
                if(v && !Array.from(prefGrid.querySelectorAll('.prefix-tag span')).some(s=>s.innerText===v)) {
                    let tag = document.createElement('div');
                    tag.className = 'ext-tag prefix-tag';
                    tag.innerHTML = `<span>${v}</span><button class="del-ext">✖</button>`;
                    tag.querySelector('.del-ext').onclick = () => tag.remove();
                    prefGrid.insertBefore(tag, addPrefDiv);
                }
                addPrefInp.value = "";
            }
        });
        addPrefDiv.appendChild(addPrefInp);
        prefGrid.appendChild(addPrefDiv);
        
        prefixGroup.appendChild(prefGrid);
        body.appendChild(prefixGroup);
    }
    
    // Camera sub-folders for Video / Images
    if(binName.includes("Video") || binName.includes("Images")) {
        let camGroup = document.createElement('div');
        camGroup.className = 'setting-group';
        
        let camHeader = document.createElement('div');
        camHeader.style.display = 'flex';
        camHeader.style.justifyContent = 'space-between';
        camHeader.style.alignItems = 'center';
        camHeader.style.marginBottom = '10px';
        
        let camLbl = document.createElement('label');
        camLbl.innerHTML = "Camera Sub-folder Colors";
        camLbl.style.margin = '0';
        
        let camSwitchLbl = document.createElement('div');
        camSwitchLbl.style.fontSize = '11px';
        camSwitchLbl.style.display = 'flex';
        camSwitchLbl.style.alignItems = 'center';
        camSwitchLbl.style.gap = '4px';
        camSwitchLbl.style.color = 'var(--text-dim)';
        camSwitchLbl.style.userSelect = 'none';
        
        let camSwitch = document.createElement('label');
        camSwitch.className = 'mini-switch';
        let camToggle = document.createElement('input');
        camToggle.type = 'checkbox';
        camToggle.checked = settings.USE_CAMERA_FOLDERS !== false;
        camToggle.onchange = (e) => {
            settings.USE_CAMERA_FOLDERS = e.target.checked;
        };
        let camSlider = document.createElement('span');
        camSlider.className = 'mini-slider';
        camSwitch.appendChild(camToggle);
        camSwitch.appendChild(camSlider);
        
        camSwitchLbl.appendChild(document.createTextNode("Use Camera Folders"));
        camSwitchLbl.appendChild(camSwitch);

        let mirrorSwitchLbl = document.createElement('div');
        mirrorSwitchLbl.style.fontSize = '11px';
        mirrorSwitchLbl.style.display = 'flex';
        mirrorSwitchLbl.style.alignItems = 'center';
        mirrorSwitchLbl.style.gap = '4px';
        mirrorSwitchLbl.style.color = 'var(--text-dim)';
        mirrorSwitchLbl.style.userSelect = 'none';
        
        let mirrorSwitch = document.createElement('label');
        mirrorSwitch.className = 'mini-switch';
        let mirrorToggle = document.createElement('input');
        mirrorToggle.type = 'checkbox';
        mirrorToggle.checked = settings.MIRROR_HARD_DRIVE === true;
        mirrorToggle.onchange = (e) => {
            settings.MIRROR_HARD_DRIVE = e.target.checked;
        };
        let mirrorSlider = document.createElement('span');
        mirrorSlider.className = 'mini-slider';
        mirrorSwitch.appendChild(mirrorToggle);
        mirrorSwitch.appendChild(mirrorSlider);
        
        mirrorSwitchLbl.appendChild(document.createTextNode("Mirror OS Folders"));
        mirrorSwitchLbl.appendChild(mirrorSwitch);

        let switchesContainer = document.createElement('div');
        switchesContainer.style.display = 'flex';
        switchesContainer.style.gap = '15px';
        switchesContainer.style.flexWrap = 'wrap';
        switchesContainer.style.alignItems = 'center';
        
        switchesContainer.appendChild(mirrorSwitchLbl);
        switchesContainer.appendChild(camSwitchLbl);

        camHeader.appendChild(camLbl);
        camHeader.appendChild(switchesContainer);
        
        let grid = document.createElement('div');
        grid.className = 'camera-grid';
        
        const cams = ["ARRI", "RED", "Blackmagic", "Sony", "Canon", "Panasonic", "Nikon", "Fujifilm", "GoPro", "DJI", "Insta360", "Olympus", "Pentax", "Leica", "Z CAM", "Kinefinity", "Phantom", "Hasselblad", "Android", "iPhone"];
        const camDesc = {
            "RED": "A001_C001..., .r3d",
            "Blackmagic": "A001_..., .braw",
            "Sony": "C0001.mp4, DSC00001.arw, .xavc",
            "Canon": "MVI_0001, A001_C001..., .crm",
            "Panasonic": "P1000001, .rw2",
            "Nikon": "DSC_0001.nef, .mov",
            "Fujifilm": "DSCF0001, FHD0001",
            "GoPro": "GOPR0001, GX010001",
            "DJI": "DJI_0001.mp4, .dng, DJI_",
            "Insta360": "VID_YYYY..._XX_NNN.insv, LRV_",
            "Olympus": "P1010001, MOV0001",
            "Pentax": "IMGP0001.pef",
            "Leica": "L1000001.dng",
            "ARRI": "A001C..., .mxf, .arx, .ari, .mov",
            "Z CAM": "ZC001_..., .zraw",
            "Kinefinity": ".mkv, .cin",
            "Phantom": ".cine, .raw",
            "Hasselblad": "HASSELBLAD..., .3fr, .fff",
            "Android": ".jpg, .mp4",
            "iPhone": "IMG_..., .heic, .mov"
        };
        
        cams.forEach(cam => {
            let crow = document.createElement('div');
            crow.className = 'camera-row';
            
            let labelDiv = document.createElement('div');
            labelDiv.style.display = 'flex';
            labelDiv.style.flexDirection = 'column';
            
            let cname = document.createElement('span');
            cname.innerHTML = cam;
            cname.style.fontWeight = "600";
            
            let csub = document.createElement('span');
            csub.innerHTML = camDesc[cam] || "";
            csub.style.fontSize = "9px";
            csub.style.color = "var(--text-dim)";
            csub.style.marginTop = "2px";
            
            labelDiv.appendChild(cname);
            labelDiv.appendChild(csub);
            
            let csel = createColorPicker(settings.BIN_COLORS[cam] || "None", "clip-color-picker camera-color-sel", "cam", cam);
            let fsel = createColorPicker(settings.BIN_FLAGS[cam] || "None", "flag-color-picker camera-flag-sel", "cam", cam, flagHexColors);
            
            csel.addEventListener('change', (e) => {
                document.querySelectorAll('.camera-color-sel[data-cam="' + cam + '"]').forEach(el => {
                    if (el !== csel) el.value = csel.value;
                });
            });
            fsel.addEventListener('change', (e) => {
                document.querySelectorAll('.camera-flag-sel[data-cam="' + cam + '"]').forEach(el => {
                    if (el !== fsel) el.value = fsel.value;
                });
            });
            
            let flexColor = document.createElement('div');
            flexColor.style.display = 'flex'; flexColor.style.gap = '5px';
            flexColor.appendChild(csel); flexColor.appendChild(fsel);
            crow.appendChild(labelDiv);
            crow.appendChild(flexColor);
            grid.appendChild(crow);
        });
        
        camGroup.appendChild(camHeader);
        camGroup.appendChild(grid);
        body.appendChild(camGroup);
    }
    
    // SFX & Music for Audio
    if(binName.includes("Audio")) {
        ["SFX", "Music"].forEach(type => {
            let group = document.createElement('div');
            group.className = 'setting-group';
            
            let lbl = document.createElement('div');
            lbl.innerHTML = type + " Configuration";
            lbl.style.fontSize = '11px';
            lbl.style.color = 'var(--text-dim)';
            lbl.style.textTransform = 'uppercase';
            lbl.style.letterSpacing = '1px';
            
            let dsSwitch = document.createElement('label');
            dsSwitch.className = 'mini-switch';
            let dsToggle = document.createElement('input');
            dsToggle.type = 'checkbox';
            dsToggle.className = type.toLowerCase() + '-deep-scan-toggle';
            dsToggle.checked = settings[type.toUpperCase() + '_DEEP_SCAN'] !== false;
            
            dsToggle.addEventListener('change', () => {
                let pathInp = group.querySelector('.' + type.toLowerCase() + '-path-inp');
                if (pathInp) pathInp.dispatchEvent(new Event('input'));
            });
            
            let dsSlider = document.createElement('span');
            dsSlider.className = 'mini-slider';
            dsSwitch.appendChild(dsToggle);
            dsSwitch.appendChild(dsSlider);
            
            let dsWrapper = document.createElement('div');
            dsWrapper.style.display = 'flex';
            dsWrapper.style.alignItems = 'center';
            dsWrapper.style.gap = '4px';
            dsWrapper.style.fontSize = '9px';
            dsWrapper.style.color = 'var(--text-dim)';
            dsWrapper.innerHTML = 'Deep Scan';
            dsWrapper.appendChild(dsSwitch);
            
            let headerFlex = document.createElement('div');
            headerFlex.style.display = 'flex';
            headerFlex.style.justifyContent = 'space-between';
            headerFlex.style.alignItems = 'center';
            headerFlex.style.marginBottom = '5px';
            headerFlex.appendChild(lbl);
            headerFlex.appendChild(dsWrapper);
            
            group.appendChild(headerFlex);
            
            let flexDiv = document.createElement('div');
            flexDiv.style.display = 'flex';
            flexDiv.style.gap = '8px';
            flexDiv.style.alignItems = 'center';
            
            let pathInp = document.createElement('input');
            pathInp.className = type.toLowerCase() + '-path-inp';
            pathInp.value = settings[type.toUpperCase() + '_PATH'] || "";
            pathInp.placeholder = "Master " + type + " Folder Path";
            pathInp.style.flex = '1';
            pathInp.style.background = 'var(--bg-card)';
            pathInp.style.border = '1px solid var(--border)';
            pathInp.style.color = 'white';
            pathInp.style.padding = '8px 10px';
            pathInp.style.borderRadius = '4px';
            pathInp.style.fontSize = '12px';
            pathInp.style.outline = 'none';
            
            let colSel = createColorPicker(settings[type.toUpperCase() + '_COLOR'] || (type === "SFX" ? "Beige" : "Pink"), "clip-color-picker " + type.toLowerCase() + "-color-sel");
            let flagSel = createColorPicker(settings[type.toUpperCase() + '_FLAG'] || "None", "flag-color-picker " + type.toLowerCase() + "-flag-sel", null, null, flagHexColors);
            let flexColor = document.createElement('div');
            flexColor.style.display = 'flex'; flexColor.style.gap = '5px';
            flexColor.appendChild(colSel); flexColor.appendChild(flagSel);
            
            let browseBtn = document.createElement('button');
            browseBtn.innerHTML = '📁 Browse';
            browseBtn.style.background = 'var(--bg-dark)';
            browseBtn.style.border = '1px solid var(--border)';
            browseBtn.style.color = 'white';
            browseBtn.style.padding = '7px 10px';
            browseBtn.style.borderRadius = '4px';
            browseBtn.style.cursor = 'pointer';
            browseBtn.style.fontSize = '12px';
            browseBtn.style.outline = 'none';
            
            browseBtn.onclick = () => {
                const { execSync } = require('child_process');
                try {
                    let res = "";
                    if (process.platform === 'darwin') {
                        let cmd = `osascript -e 'tell application "Finder" to POSIX path of (choose folder with prompt "Select Master ${type} Folder")'`;
                        res = execSync(cmd).toString().trim();
                    } else if (process.platform === 'linux') {
                        try {
                            res = execSync(`zenity --file-selection --directory --title="Select Master ${type} Folder"`).toString().trim();
                        } catch(e) {
                            try { res = execSync(`kdialog --getexistingdirectory / --title "Select Master ${type} Folder"`).toString().trim(); }
                            catch(e2) { console.error("No supported dialog tool found on Linux."); }
                        }
                    } else {
                        let cmd = `powershell -WindowStyle Hidden -STA -Command "Add-Type -AssemblyName System.windows.forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Title = 'Select Master ${type} Folder'; $f.ValidateNames = $false; $f.CheckFileExists = $false; $f.CheckPathExists = $true; $f.FileName = 'Select_Folder_Here'; $res = $f.ShowDialog(); if($res -eq 'OK'){ Split-Path $f.FileName }"`;
                        res = execSync(cmd).toString().trim();
                    }
                    if(res) {
                        pathInp.value = res;
                        let evt = new Event('input');
                        pathInp.dispatchEvent(evt);
                    }
                } catch(e) {}
            };
            
            let wrapperDiv = document.createElement('div');
            wrapperDiv.style.display = 'flex';
            wrapperDiv.style.flexDirection = 'column';
            wrapperDiv.style.width = '100%';
            
            let subfolderPreview = document.createElement('div');
            subfolderPreview.style.width = '100%';
            subfolderPreview.style.marginTop = '10px';
            subfolderPreview.style.fontSize = '10px';
            
            const updatePreview = (val) => {
                subfolderPreview.innerHTML = '';
                if(!val || val.trim() === "") return;
                try {
                    if(fs.existsSync(val)) {
                        const path = require('path');
                        let isDeep = dsToggle.checked;
                        let items = fs.readdirSync(val, {withFileTypes: true, recursive: isDeep});
                        let tree = buildFolderTree(items, val);
                        let topLevels = Object.keys(tree).sort();
                        
                        if(topLevels.length > 0) {
                            let masterDetails = document.createElement('details');
                            masterDetails.className = 'master-accordion';
                            masterDetails.open = false;
                            
                            masterDetails.addEventListener('toggle', () => {
                                if (masterDetails.open) {
                                    document.querySelectorAll('.master-accordion').forEach(other => {
                                        if (other !== masterDetails && other.open) {
                                            other.open = false;
                                        }
                                    });
                                }
                            });
                            
                            let masterSummary = document.createElement('summary');
                            masterSummary.style.display = 'flex';
                            masterSummary.style.justifyContent = 'space-between';
                            masterSummary.style.alignItems = 'center';
                            masterSummary.style.marginBottom = '8px';
                            masterSummary.style.padding = '5px';
                            masterSummary.style.cursor = 'pointer';
                            masterSummary.style.background = 'var(--bg)';
                            masterSummary.style.borderRadius = '4px';
                            masterSummary.style.outline = 'none';
                            masterSummary.style.userSelect = 'none';
                            
                            let countLbl = document.createElement('span');
                            countLbl.innerHTML = `▶ Found ${topLevels.length} main folders`;
                            countLbl.style.fontSize = '12px';
                            countLbl.style.fontWeight = 'bold';
                            countLbl.style.color = 'var(--text-dim)';
                            
                            masterDetails.addEventListener('toggle', () => {
                                countLbl.innerHTML = (masterDetails.open ? '▼ ' : '▶ ') + `Found ${topLevels.length} main folders`;
                            });
                            
                            let toggleAllBtn = document.createElement('button');
                            toggleAllBtn.innerHTML = 'Expand All';
                            toggleAllBtn.style.fontSize = '10px';
                            toggleAllBtn.style.padding = '3px 8px';
                            toggleAllBtn.style.background = 'var(--bg-dark)';
                            toggleAllBtn.style.border = '1px solid var(--border)';
                            toggleAllBtn.style.color = 'white';
                            toggleAllBtn.style.borderRadius = '4px';
                            toggleAllBtn.style.cursor = 'pointer';
                            
                            toggleAllBtn.onclick = (e) => {
                                e.stopPropagation();
                                let isExpand = toggleAllBtn.innerHTML === 'Expand All';
                                masterDetails.querySelectorAll('details').forEach(d => {
                                    if (d !== masterDetails) {
                                        let st = d.querySelector('.summ-title-text');
                                        if (st && st.dataset.expandable === 'true') {
                                            d.open = isExpand;
                                            st.innerHTML = (isExpand ? '▼ ' : '▶ ') + st.dataset.name;
                                        }
                                    }
                                });
                                toggleAllBtn.innerHTML = isExpand ? 'Collapse All' : 'Expand All';
                            };
                            
                            masterSummary.appendChild(countLbl);
                            masterSummary.appendChild(toggleAllBtn);
                            masterDetails.appendChild(masterSummary);
                            
                            let foldersContainer = document.createElement('div');

                            renderFolderTree(tree, foldersContainer, type.toLowerCase());
                            
                            masterDetails.appendChild(foldersContainer);
                            subfolderPreview.appendChild(masterDetails);
                        } else {
                            subfolderPreview.innerHTML = '<span style="color:var(--text-dim)">No subfolders found.</span>';
                        }
                    } else {
                        subfolderPreview.innerHTML = '<span style="color:#ff5555">Path does not exist!</span>';
                    }
                } catch(e) {}
            };
            
            pathInp.addEventListener('input', (e) => updatePreview(e.target.value));
            updatePreview(settings[type.toUpperCase() + '_PATH']);
            
            flexDiv.appendChild(pathInp);
            flexDiv.appendChild(browseBtn);
            flexDiv.appendChild(flexColor);
            
            wrapperDiv.appendChild(flexDiv);
            wrapperDiv.appendChild(subfolderPreview);
            
            group.appendChild(lbl);
            group.appendChild(wrapperDiv);
            body.appendChild(group);
        });
    }
    
    // Custom Master Folders
    let isTypeFolder = (binName.toLowerCase().includes("timeline") || binName.toLowerCase().includes("clip") || binName.toLowerCase().includes("fusion") || binName.toLowerCase().includes("multicam") || binName.toLowerCase().includes("photo album"));
    if (!isTypeFolder && !isIgnoreRule && binName !== "📂 SRT") {
        let customContainer = document.createElement('div');
        customContainer.className = 'custom-master-container';
        
        let existingCustoms = (settings.CUSTOM_MASTER_FOLDERS || []).filter(m => m.targetBin === binName);
        existingCustoms.forEach(m => {
            customContainer.appendChild(createCustomMasterBlock(m.name, m.path, m.color, m.deepScan, m.noSound));
        });
        
        let addCustomBtn = document.createElement('button');
        addCustomBtn.className = 'btn secondary outline';
        addCustomBtn.style.marginTop = '15px';
        addCustomBtn.style.fontSize = '12px';
        addCustomBtn.style.display = 'block';
        addCustomBtn.innerHTML = '+ Add Master Folder (e.g. OBS, VFX)';
        
        let inputContainer = document.createElement('div');
        inputContainer.style.display = 'none';
        inputContainer.style.marginTop = '15px';
        inputContainer.style.gap = '8px';
        inputContainer.style.alignItems = 'center';
        
        let nameInput = document.createElement('input');
        nameInput.placeholder = "Folder Name (e.g. OBS)...";
        nameInput.style.flex = '1';
        nameInput.style.background = 'var(--bg-card)';
        nameInput.style.border = '1px solid var(--border)';
        nameInput.style.color = 'white';
        nameInput.style.padding = '8px 10px';
        nameInput.style.borderRadius = '4px';
        nameInput.style.fontSize = '12px';
        nameInput.style.outline = 'none';
        
        let confirmAddBtn = document.createElement('button');
        confirmAddBtn.innerHTML = 'Add';
        confirmAddBtn.className = 'btn primary';
        confirmAddBtn.style.padding = '8px 15px';
        confirmAddBtn.onclick = () => {
            let n = nameInput.value.trim();
            if (n && !n.startsWith("📂")) {
                n = "📂 " + n;
            } else if (n && n.startsWith("📂") && !n.startsWith("📂 ")) {
                n = n.replace("📂", "📂 ");
            }
            if(n) {
                customContainer.appendChild(createCustomMasterBlock(n, "", "Pink"));
                nameInput.value = "";
                inputContainer.style.display = 'none';
                addCustomBtn.style.display = 'block';
            }
        };
        
        let inlineBrowseBtn = document.createElement('button');
        inlineBrowseBtn.innerHTML = '📁 Browse';
        inlineBrowseBtn.className = 'btn secondary outline';
        inlineBrowseBtn.style.padding = '8px 15px';
        inlineBrowseBtn.onclick = () => {
            const { execSync } = require('child_process');
            try {
                let res = "";
                if (process.platform === 'darwin') {
                    let cmd = `osascript -e 'tell application "Finder" to POSIX path of (choose folder with prompt "Select Master Folder")'`;
                    res = execSync(cmd).toString().trim();
                } else if (process.platform === 'linux') {
                    try {
                        res = execSync(`zenity --file-selection --directory --title="Select Master Folder"`).toString().trim();
                    } catch(e) {
                        try { res = execSync(`kdialog --getexistingdirectory / --title "Select Master Folder"`).toString().trim(); }
                        catch(e2) { console.error("No supported dialog tool found on Linux."); }
                    }
                } else {
                    let cmd = `powershell -WindowStyle Hidden -STA -Command "Add-Type -AssemblyName System.windows.forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Title = 'Select Master Folder'; $f.ValidateNames = $false; $f.CheckFileExists = $false; $f.CheckPathExists = $true; $f.FileName = 'Select_Folder_Here'; $res = $f.ShowDialog(); if($res -eq 'OK'){ Split-Path $f.FileName }"`;
                    res = execSync(cmd).toString().trim();
                }
                if(res) {
                    let folderName = res.split(/[\\/]/).filter(p=>p).pop();
                    if(!folderName) folderName = "Custom Folder";
                    customContainer.appendChild(createCustomMasterBlock(folderName, res, "Pink"));
                    nameInput.value = "";
                    inputContainer.style.display = 'none';
                    addCustomBtn.style.display = 'block';
                }
            } catch(e) {}
        };
        
        let cancelAddBtn = document.createElement('button');
        cancelAddBtn.innerHTML = 'Cancel';
        cancelAddBtn.className = 'btn secondary outline';
        cancelAddBtn.style.padding = '8px 15px';
        cancelAddBtn.onclick = () => {
            nameInput.value = "";
            inputContainer.style.display = 'none';
            addCustomBtn.style.display = 'block';
        };
        
        inputContainer.appendChild(nameInput);
        inputContainer.appendChild(inlineBrowseBtn);
        inputContainer.appendChild(confirmAddBtn);
        inputContainer.appendChild(cancelAddBtn);
        
        addCustomBtn.onclick = () => {
            addCustomBtn.style.display = 'none';
            inputContainer.style.display = 'flex';
            nameInput.focus();
        };
        
        body.appendChild(customContainer);
        body.appendChild(inputContainer);
        body.appendChild(addCustomBtn);
    }
    
    div.appendChild(header);
    div.appendChild(body);
    return div;
}

function renderSettings() {
    const list = document.getElementById('settings-list');
    list.innerHTML = '';
    
    let clipToggle = document.getElementById('toggle-clip-color');
    let flagToggle = document.getElementById('toggle-flag');
    clipToggle.checked = settings.ENABLE_CLIP_COLORS;
    flagToggle.checked = settings.ENABLE_FLAGS;
    
    clipToggle.onchange = (e) => {
        settings.ENABLE_CLIP_COLORS = e.target.checked;
        document.querySelectorAll('.clip-color-picker').forEach(el => el.style.display = e.target.checked ? 'inline-block' : 'none');
    };
    
    flagToggle.onchange = (e) => {
        settings.ENABLE_FLAGS = e.target.checked;
        document.querySelectorAll('.flag-color-picker').forEach(el => el.style.display = e.target.checked ? 'inline-block' : 'none');
    };
    
    let globalFlex = document.createElement('div');
    globalFlex.style.display = 'flex';
    globalFlex.style.justifyContent = 'space-between';
    globalFlex.style.alignItems = 'center';
    globalFlex.style.marginTop = '15px';
    globalFlex.style.marginBottom = '5px';
    
    let globalP = document.createElement('h3');
    globalP.style.margin = '0'; globalP.style.fontSize = '14px'; globalP.innerHTML = "OS Folder Scanning";
    globalFlex.appendChild(globalP);
    
    let globalSwitches = document.createElement('div');
    globalSwitches.style.display = 'flex';
    globalSwitches.style.gap = '15px';
    globalSwitches.style.alignItems = 'center';
    
    let deepSwitchLbl = document.createElement('div');
    deepSwitchLbl.style.fontSize = '11px';
    deepSwitchLbl.style.display = 'flex';
    deepSwitchLbl.style.alignItems = 'center';
    deepSwitchLbl.style.gap = '4px';
    deepSwitchLbl.style.color = 'var(--text-dim)';
    deepSwitchLbl.style.userSelect = 'none';
    
    let deepSwitch = document.createElement('label');
    deepSwitch.className = 'mini-switch';
    let deepToggle = document.createElement('input');
    deepToggle.type = 'checkbox';
    let allDeepScanOn = settings.SFX_DEEP_SCAN !== false && settings.MUSIC_DEEP_SCAN !== false && (settings.CUSTOM_MASTER_FOLDERS || []).every(m => m.deepScan !== false);
    deepToggle.checked = allDeepScanOn;
    deepToggle.onchange = (e) => {
        let isChecked = e.target.checked;
        settings.SFX_DEEP_SCAN = isChecked;
        settings.MUSIC_DEEP_SCAN = isChecked;
        if(settings.CUSTOM_MASTER_FOLDERS) {
            settings.CUSTOM_MASTER_FOLDERS.forEach(m => m.deepScan = isChecked);
        }
        renderSettings();
        setTimeout(() => {
            document.querySelectorAll('.sfx-path-inp, .music-path-inp, .custom-master-path-inp').forEach(inp => {
                inp.dispatchEvent(new Event('input'));
            });
        }, 100);
    };
    let deepSlider = document.createElement('span');
    deepSlider.className = 'mini-slider';
    deepSwitch.appendChild(deepToggle);
    deepSwitch.appendChild(deepSlider);
    
    deepSwitchLbl.appendChild(document.createTextNode("Deep Scan Master Folders"));
    deepSwitchLbl.appendChild(deepSwitch);

    globalSwitches.appendChild(deepSwitchLbl);
    
    globalFlex.appendChild(globalSwitches);
    list.appendChild(globalFlex);
    
    const defaultFolders = ["📂 Video", "📂 Audio", "📂 Images", "📂 Documents", "📂 SRT", "📂 Sequences", "📂 Design", "📂 Timelines", "📂 Compound Clips", "📂 Multicam", "📂 Photo Albums", "📂 Fusion"];
    let flex = document.createElement('div');
    flex.style.display = 'flex';
    flex.style.justifyContent = 'space-between';
    flex.style.alignItems = 'center';
    flex.style.marginTop = '5px';
    
    let p = document.createElement('h3');
    p.style.margin = '0'; p.style.fontSize = '14px'; p.innerHTML = "Extension Folders";
    flex.appendChild(p);
    
    let masterLbl = document.createElement('div');
    masterLbl.style.fontSize = '11px';
    masterLbl.style.display = 'flex';
    masterLbl.style.alignItems = 'center';
    masterLbl.style.gap = '4px';
    masterLbl.style.color = 'var(--text-dim)';
    masterLbl.style.userSelect = 'none';
    
    let mSwitch = document.createElement('label');
    mSwitch.className = 'mini-switch';
    let mToggle = document.createElement('input');
    mToggle.type = 'checkbox';
    let allOn = settings.BIN_RULES.every(r => r.useExt !== false);
    mToggle.checked = allOn;
    mToggle.onchange = (e) => {
        settings.BIN_RULES.forEach(r => r.useExt = e.target.checked);
        renderSettings();
    };
    let mSlider = document.createElement('span');
    mSlider.className = 'mini-slider';
    mSwitch.appendChild(mToggle);
    mSwitch.appendChild(mSlider);
    
    masterLbl.appendChild(document.createTextNode("Use File Extensions"));
    masterLbl.appendChild(mSwitch);
    flex.appendChild(masterLbl);
    
    list.appendChild(flex);

    settings.BIN_RULES.forEach(r => {
        if(defaultFolders.includes(r.bin)) {
            let c = settings.BIN_COLORS[r.bin] || "None";
            list.appendChild(createRow(r.bin, r.exts.join(", "), c, false, false));
        }
    });
    
    let p2 = document.createElement('h3');
    p2.style.margin = '15px 0 5px 0'; p2.style.fontSize = '14px'; p2.innerHTML = "Type Folders (e.g. Timelines)";
    list.appendChild(p2);
    
    settings.TYPE_RULES.forEach(r => {
        if(defaultFolders.includes(r.bin)) {
            let c = settings.BIN_COLORS[r.bin] || "None";
            list.appendChild(createRow(r.bin, r.types.join(", "), c, true, false));
        }
    });
    
    let customBin = settings.BIN_RULES.filter(r => !defaultFolders.includes(r.bin));
    let customType = settings.TYPE_RULES.filter(r => !defaultFolders.includes(r.bin));
    
    if(customBin.length > 0 || customType.length > 0) {
        let p3 = document.createElement('h3');
        p3.style.margin = '15px 0 5px 0'; p3.style.fontSize = '14px'; p3.innerHTML = "Custom Folders";
        list.appendChild(p3);
        
        customBin.forEach(r => {
            let c = settings.BIN_COLORS[r.bin] || "None";
            list.appendChild(createRow(r.bin, r.exts.join(", "), c, false));
        });
        customType.forEach(r => {
            let c = settings.BIN_COLORS[r.bin] || "None";
            list.appendChild(createRow(r.bin, r.types.join(", "), c, true));
        });
    }

    let p4 = document.createElement('h3');
    p4.style.margin = '15px 0 5px 0'; p4.style.fontSize = '14px'; p4.innerHTML = "Ignored Folders";
    list.appendChild(p4);
    
    let ignoreExts = settings.IGNORE_FOLDERS ? settings.IGNORE_FOLDERS.join(", ") : "";
    let ignoreRow = createRow("🚫 Ignore These", ignoreExts, "None", false, false, true);
    ignoreRow.dataset.isIgnoreRule = "true";
    list.appendChild(ignoreRow);

}

document.getElementById('btn-add-rule').addEventListener('click', () => {
    let list = document.getElementById('settings-list');
    let hasCustomHeader = Array.from(list.querySelectorAll('h3')).some(h => h.innerText === "Custom Folders");
    
    if(!hasCustomHeader) {
        let p3 = document.createElement('h3');
        p3.style.margin = '15px 0 5px 0'; p3.style.fontSize = '14px'; p3.innerHTML = "Custom Folders";
        list.appendChild(p3);
    }
    
    let existingNames = Array.from(list.querySelectorAll('.folder-name')).map(inp => inp.value.trim());
    let baseName = "📂 New Folder";
    let finalName = baseName;
    let counter = 1;
    while(existingNames.includes(finalName)) {
        finalName = baseName + " " + counter;
        counter++;
    }
    
    list.appendChild(createRow(finalName, "", "None"));
    list.scrollTop = list.scrollHeight;
});


document.getElementById('btn-save').addEventListener('click', () => {
    let newBin = [];
    let newType = [];
    let newCols = {};
    let newFlags = {};
    let newSfxCol = settings.SFX_COLOR;
    let newSfxFlag = settings.SFX_FLAG || "None";
    let newSfxPath = settings.SFX_PATH || "";
    let newMusCol = settings.MUSIC_COLOR;
    let newMusFlag = settings.MUSIC_FLAG || "None";
    let newMusPath = settings.MUSIC_PATH || "";
    let newCustomMasters = [];
    
    let analyzeToggle = document.querySelector('.analyze-timeline-toggle');
    if (analyzeToggle) settings.ANALYZE_TIMELINES = analyzeToggle.checked;
    
    let analyzeToggleRes = document.querySelector('.analyze-timeline-res-toggle');
    if (analyzeToggleRes) settings.ANALYZE_TIMELINE_RES = analyzeToggleRes.checked;
    
    let analyzeToggleFps = document.querySelector('.analyze-timeline-fps-toggle');
    if (analyzeToggleFps) settings.ANALYZE_TIMELINE_FPS = analyzeToggleFps.checked;
    
    let rows = document.getElementById('settings-list').querySelectorAll('.accordion-item');
    rows.forEach(row => {
        let bin = row.querySelector('.folder-name').value.trim();
        let colEl = row.querySelector('.accordion-header .accordion-color-sel');
        let flagEl = row.querySelector('.accordion-header .accordion-flag-sel');
        let col = colEl ? colEl.value : "None";
        let flag = flagEl ? flagEl.value : "None";
        
        let tags = row.querySelectorAll('.ext-grid:not(.prefix-grid) .ext-tag span');
        let arr = Array.from(tags).map(s => s.innerText.trim());
        
        if(bin) {
            if(row.dataset.isIgnoreRule === "true") {
                settings.IGNORE_FOLDERS = arr;
                let pTags = row.querySelectorAll('.prefix-grid .prefix-tag span');
                let pArr = Array.from(pTags).map(s => s.innerText.trim());
                settings.IGNORE_CLIPS = pArr;
            } else if(row.dataset.isTypeRule === "true") {
                  let usePrefToggle = row.querySelector('.use-prefix-toggle');
                  let usePref = usePrefToggle ? usePrefToggle.checked : true;
                  let prefColorBtn = row.querySelector('.prefix-color-btn');
                  let prefColor = prefColorBtn ? prefColorBtn.value : "None";
                  let pTags = row.querySelectorAll('.prefix-grid .prefix-tag span');
                  let pArr = Array.from(pTags).map(s => s.innerText.trim());
                  newType.push({bin: bin, types: arr, prefixes: pArr, usePrefixes: usePref, prefixColor: prefColor});
              } else {
                let useExtToggle = row.querySelector('.use-ext-toggle');
                let useExt = useExtToggle ? useExtToggle.checked : true;
                let extColorBtn = row.querySelector('.ext-color-btn');
                let extColor = extColorBtn ? extColorBtn.value : "None";
                
                let usePrefToggle = row.querySelector('.use-prefix-toggle');
                let usePref = usePrefToggle ? usePrefToggle.checked : true;
                let prefColorBtn = row.querySelector('.prefix-color-btn');
                let prefColor = prefColorBtn ? prefColorBtn.value : "None";
                let pTags = row.querySelectorAll('.prefix-grid .prefix-tag span');
                let pArr = Array.from(pTags).map(s => s.innerText.trim());
                
                newBin.push({bin: bin, exts: arr.map(s=>s.toLowerCase()), useExt: useExt, extColor: extColor, prefixes: pArr, usePrefixes: usePref, prefixColor: prefColor});
            }
            if(col === "None" && !settings.ENABLE_CLIP_COLORS && settings.BIN_COLORS[bin]) col = settings.BIN_COLORS[bin];
            if(flag === "None" && !settings.ENABLE_FLAGS && settings.BIN_FLAGS[bin]) flag = settings.BIN_FLAGS[bin];
            
            if(col !== "None") newCols[bin] = col;
            if(flag !== "None") newFlags[bin] = flag;
        }
        
        // Grab camera colors if this row has them
        let camSels = row.querySelectorAll('.camera-color-sel');
        camSels.forEach(sel => {
            let cam = sel.dataset.cam;
            let c = sel.value;
            if(c === "None" && !settings.ENABLE_CLIP_COLORS && settings.BIN_COLORS[cam]) c = settings.BIN_COLORS[cam];
            if(c !== "None") newCols[cam] = c;
        });
        
        let camFlagSels = row.querySelectorAll('.camera-flag-sel');
        camFlagSels.forEach(sel => {
            let cam = sel.dataset.cam;
            let f = sel.value;
            if(f === "None" && !settings.ENABLE_FLAGS && settings.BIN_FLAGS[cam]) f = settings.BIN_FLAGS[cam];
            if(f !== "None") newFlags[cam] = f;
        });
        
        // Grab SFX config
        let sfxSel = row.querySelector('.sfx-color-sel');
        if(sfxSel) {
            let c = sfxSel.value;
            if(c === "None" && !settings.ENABLE_CLIP_COLORS && settings.SFX_COLOR) c = settings.SFX_COLOR;
            newSfxCol = c;
        }
        let sfxFlagSel = row.querySelector('.sfx-flag-sel');
        if(sfxFlagSel) {
            let f = sfxFlagSel.value;
            if(f === "None" && !settings.ENABLE_FLAGS && settings.SFX_FLAG) f = settings.SFX_FLAG;
            newSfxFlag = f;
        }
        let sfxInp = row.querySelector('.sfx-path-inp');
        if(sfxInp) newSfxPath = sfxInp.value.trim();
        let sfxDsToggle = row.querySelector('.sfx-deep-scan-toggle');
        if(sfxDsToggle) settings.SFX_DEEP_SCAN = sfxDsToggle.checked;
        
        let sfxSubSels = row.querySelectorAll('.sfx-subfolder-color-sel');
        sfxSubSels.forEach(sel => {
            let fName = sel.dataset.folder;
            let c = sel.value;
            if(c === "None" && !settings.ENABLE_CLIP_COLORS && settings.BIN_COLORS[fName]) c = settings.BIN_COLORS[fName];
            if(c !== "None") newCols[fName] = c;
        });
        let sfxSubFlagSels = row.querySelectorAll('.sfx-subfolder-flag-sel');
        sfxSubFlagSels.forEach(sel => {
            let fName = sel.dataset.folder;
            let f = sel.value;
            if(f === "None" && !settings.ENABLE_FLAGS && settings.BIN_FLAGS[fName]) f = settings.BIN_FLAGS[fName];
            if(f !== "None") newFlags[fName] = f;
        });

        // Grab Music config
        let musSel = row.querySelector('.music-color-sel');
        if(musSel) {
            let c = musSel.value;
            if(c === "None" && !settings.ENABLE_CLIP_COLORS && settings.MUSIC_COLOR) c = settings.MUSIC_COLOR;
            newMusCol = c;
        }
        let musFlagSel = row.querySelector('.music-flag-sel');
        if(musFlagSel) {
            let f = musFlagSel.value;
            if(f === "None" && !settings.ENABLE_FLAGS && settings.MUSIC_FLAG) f = settings.MUSIC_FLAG;
            newMusFlag = f;
        }
        let musInp = row.querySelector('.music-path-inp');
        if(musInp) newMusPath = musInp.value.trim();
        let musDsToggle = row.querySelector('.music-deep-scan-toggle');
        if(musDsToggle) settings.MUSIC_DEEP_SCAN = musDsToggle.checked;
        
        let musSubSels = row.querySelectorAll('.music-subfolder-color-sel');
        musSubSels.forEach(sel => {
            let fName = sel.dataset.folder;
            let c = sel.value;
            if(c === "None" && !settings.ENABLE_CLIP_COLORS && settings.BIN_COLORS[fName]) c = settings.BIN_COLORS[fName];
            if(c !== "None") newCols[fName] = c;
        });
        let musSubFlagSels = row.querySelectorAll('.music-subfolder-flag-sel');
        musSubFlagSels.forEach(sel => {
            let fName = sel.dataset.folder;
            let f = sel.value;
            if(f === "None" && !settings.ENABLE_FLAGS && settings.BIN_FLAGS[fName]) f = settings.BIN_FLAGS[fName];
            if(f !== "None") newFlags[fName] = f;
        });
        
        // Grab Custom Master Folders
        let customBlocks = row.querySelectorAll('.custom-master-group');
        customBlocks.forEach(blk => {
            let n = blk.dataset.name;
            let p = blk.querySelector('.custom-master-path-inp').value.trim();
            let c = blk.querySelector('.custom-master-color-sel').value;
            let f = blk.querySelector('.custom-master-flag-sel').value;
            let dsToggle = blk.querySelector('.custom-master-deep-scan-toggle');
            let ds = dsToggle ? dsToggle.checked : true;
            let nsToggle = blk.querySelector('.custom-master-no-sound-toggle');
            let ns = nsToggle ? nsToggle.checked : false;
            
            let existing = settings.CUSTOM_MASTER_FOLDERS ? settings.CUSTOM_MASTER_FOLDERS.find(x => x.name === n) : null;
            if(c === "None" && !settings.ENABLE_CLIP_COLORS && existing && existing.color) c = existing.color;
            if(f === "None" && !settings.ENABLE_FLAGS && existing && existing.flag) f = existing.flag;
            
            newCustomMasters.push({ name: n, path: p, color: c, flag: f, targetBin: bin, deepScan: ds, noSound: ns });
            
            let customSubSels = blk.querySelectorAll('.custom-master-subfolder-color-sel');
            customSubSels.forEach(sel => {
                let fName = sel.dataset.folder;
                let cc = sel.value;
                if(cc === "None" && !settings.ENABLE_CLIP_COLORS && settings.BIN_COLORS[fName]) cc = settings.BIN_COLORS[fName];
                if(cc !== "None") newCols[fName] = cc;
            });
            let customSubFlagSels = blk.querySelectorAll('.custom-master-subfolder-flag-sel');
            customSubFlagSels.forEach(sel => {
                let fName = sel.dataset.folder;
                let ff = sel.value;
                if(ff === "None" && !settings.ENABLE_FLAGS && settings.BIN_FLAGS[fName]) ff = settings.BIN_FLAGS[fName];
                if(ff !== "None") newFlags[fName] = ff;
            });
        });
    });
    
    // Validate for duplicate Master Folder paths
    let allPaths = [];
    let dupPaths = [];
    let hasDuplicate = false;
    let addPath = (p) => {
        if(p) {
            let norm = p.replace(/\\/g, '/').toLowerCase();
            if(allPaths.includes(norm)) {
                hasDuplicate = true;
                if(!dupPaths.includes(norm)) dupPaths.push(norm);
            }
            allPaths.push(norm);
        }
    };
    addPath(newSfxPath);
    addPath(newMusPath);
    newCustomMasters.forEach(m => addPath(m.path));
    
    // Clear old errors
    let allInps = document.querySelectorAll('.sfx-path-inp, .music-path-inp, .custom-master-path-inp');
    allInps.forEach(inp => inp.style.border = '1px solid var(--border)');
    
    if(hasDuplicate) {
        allInps.forEach(inp => {
            let val = inp.value.trim();
            if(val) {
                let norm = val.replace(/\\/g, '/').toLowerCase();
                if(dupPaths.includes(norm)) {
                    inp.style.border = '1px solid #FF6B6B';
                    let accItem = inp.closest('.accordion-item');
                    if(accItem) accItem.classList.add('expanded');
                }
            }
        });
        document.getElementById('error-modal-msg').innerHTML = "You cannot use the same Master Folder path multiple times.<br><br>The duplicate paths have been highlighted in <span style='color:#FF6B6B; font-weight:600;'>Red</span>.";
        document.getElementById('error-modal').style.display = 'flex';
        return;
    }
    
    settings.BIN_RULES = newBin;
    settings.TYPE_RULES = newType;
    settings.BIN_COLORS = newCols;
    settings.BIN_FLAGS = newFlags;
    settings.SFX_COLOR = newSfxCol;
    settings.SFX_FLAG = newSfxFlag;
    settings.SFX_PATH = newSfxPath;
    settings.MUSIC_COLOR = newMusCol;
    settings.MUSIC_FLAG = newMusFlag;
    settings.MUSIC_PATH = newMusPath;
    settings.CUSTOM_MASTER_FOLDERS = newCustomMasters;
    saveSettings();
    
    try { window.resizeTo(500, 370); } catch(e) {}
    document.getElementById('settings-card').style.display = 'none';
    document.getElementById('organize-card').style.display = 'block';
      document.querySelector('footer').style.display = 'block';
});

document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('reset-modal').style.display = 'flex';
});

document.getElementById('btn-modal-cancel').addEventListener('click', () => {
    document.getElementById('reset-modal').style.display = 'none';
});

if (document.getElementById('btn-update-ok')) {
    document.getElementById('btn-update-ok').addEventListener('click', () => {
        document.getElementById('update-modal').style.display = 'none';
    });
}

document.getElementById('btn-modal-confirm').addEventListener('click', () => {
    let resetColors = document.getElementById('reset-colors').checked;
    let resetFolders = document.getElementById('reset-folders').checked;
    let resetPaths = document.getElementById('reset-paths').checked;
    let resetPrefixes = document.getElementById('reset-prefixes').checked;

    if (!resetColors && !resetFolders && !resetPaths && !resetPrefixes) {
        document.getElementById('error-modal-msg').innerHTML = "<strong>Please select at least one option to reset!</strong>";
        document.getElementById('error-modal').style.display = 'flex';
        return;
    }

    document.getElementById('reset-modal').style.display = 'none';

    if (resetColors) {
        settings.ENABLE_CLIP_COLORS = true;
        settings.ENABLE_FLAGS = false;
        settings.BIN_COLORS = {
            "📂 Video": "Purple", "📂 Audio": "Pink", "📂 Images": "Teal", "📂 Documents": "Yellow", 
            "📂 Sequences": "Green", "📂 Design": "Pink", "📂 Timelines": "Blue",
            "📂 Compound Clips": "Green", "📂 Fusion": "Orange", "📂 Other Files": "Orange",
            "Canon": "Orange", "Nikon": "Yellow", "Sony": "Orange", "Fujifilm": "Green", 
            "Panasonic": "Pink", "Olympus": "Teal", "Pentax": "Purple", "Leica": "Orange", 
            "GoPro": "Teal", "DJI": "Green", "Insta360": "Yellow", "Blackmagic": "Blue", "ARRI": "Orange",
            "RED": "Orange", "Z CAM": "Blue", "Kinefinity": "Orange", "Phantom": "Purple", "Hasselblad": "Yellow",
            "Android": "Green", "iPhone": "Yellow"
        };
        settings.BIN_FLAGS = {};
        settings.SFX_COLOR = "Beige";
        settings.SFX_FLAG = "None";
        settings.MUSIC_COLOR = "Pink";
        settings.MUSIC_FLAG = "None";
    }

    if (resetFolders) {
        settings.BIN_RULES = [
            { bin: "📂 Video", exts: ["mp4","mov","avi","mkv","wmv","flv","webm","mpg","mpeg","m4v","3gp","ogv","mxf","dv","vob","ts","m2ts","r3d","ari","braw","cine","crm","lrv","asf","rm","divx","f4v","mts"] },
            { bin: "📂 Audio", exts: ["mp3","wav","aiff","aif","flac","m4a","ogg","opus","wma","caf","ac3","aac"] },
            { bin: "📂 Images", exts: ["jpg","jpeg","png","gif","bmp","tiff","tif","webp","heic","heif","svg","arw","cr2","cr3","nef","raf","rw2","orf","pef","dng","3fr","fff","gpr","srw","x3f","raw","insp"] },
            { bin: "📂 Documents", exts: ["pdf","txt","doc","docx","xml","csv","edl","aaf","fcpxml","json"] },
            { bin: "📂 SRT", exts: ["srt","vtt","dfxp"] },
            { bin: "📂 Sequences", exts: ["dpx","exr","tga","cin"] },
            { bin: "📂 Design", exts: ["psd","eps","ico","af","ai","afphoto","afdesign","afpub","sketch","xd"] }
        ];
        settings.TYPE_RULES = [
            { bin: "📂 Timelines", types: ["Timeline", "Horizontal", "Vertical", "Square", "SD", "HD", "FHD", "2K", "4K", "8K", "23.976fps", "24fps", "25fps", "29.97fps", "30fps", "50fps", "59.94fps", "60fps"] },
            { bin: "📂 Compound Clips", types: ["Compound Clip", "Compound"] },
            { bin: "📂 Multicam", types: ["Multicam Clip", "Multicam"] },
            { bin: "📂 Photo Albums", types: ["Photo Album", "PhotoAlbum", "Image Sequence", "Still Sequence"] },
            { bin: "📂 Fusion", types: ["Fusion Clip", "Fusion", "Fusion Title", "Fusion Generator", "Fusion Composition", "Generator", "Adjustment Clip"] }
        ];
        settings.CAMERA_RULES = [
            { brand: "Blackmagic", prefixes: ["A", "BRAW"], exts: ["braw", "dng", "mov", "mp4"] },
            { brand: "Sony", prefixes: ["C", "DSC"], exts: ["mp4", "mov", "mxf", "arw", "jpg", "jpeg"] },
            { brand: "iPhone", prefixes: ["IMG_"], exts: ["hevc", "heif", "heic", "mov", "mp4", "jpg", "jpeg"] },
            { brand: "Canon", prefixes: ["MVI_", "IMG_"], exts: ["mp4", "mov", "cr2", "cr3", "jpg", "jpeg"] },
            { brand: "Panasonic", prefixes: ["P"], exts: ["mp4", "mov", "mts", "rw2", "jpg", "jpeg"] },
            { brand: "Nikon", prefixes: ["DSC_"], exts: ["nef", "mov", "mp4", "jpg", "jpeg"] },
            { brand: "Fujifilm", prefixes: ["DSCF", "FHD"], exts: ["mov", "mp4", "raf", "jpg", "jpeg"] },
            { brand: "GoPro", prefixes: ["GX0", "GOPR"], exts: ["mp4", "gpr", "jpg", "jpeg"] },
            { brand: "DJI", prefixes: ["DJI_"], exts: ["mp4", "mov", "dng", "jpg", "jpeg"] },
            { brand: "Insta360", prefixes: ["VID_", "IMG_"], exts: ["insv", "mp4", "dng"] },
            { brand: "Olympus", prefixes: ["MOV", "P101"], exts: ["mov", "mp4", "orf", "jpg", "jpeg"] },
            { brand: "Pentax", prefixes: ["IMGP"], exts: ["pef", "dng", "mov", "mp4", "jpg", "jpeg"] },
            { brand: "Leica", prefixes: ["L1"], exts: ["dng", "mp4", "jpg", "jpeg"] }
        ];
        settings.BIN_MISC = "📂 Other Files";
        settings.CUSTOM_MASTER_FOLDERS = [];
    }

    if (resetPaths) {
        settings.SFX_PATH = "";
        settings.MUSIC_PATH = "";
    }

    if (resetPrefixes) {
        if (settings.BIN_RULES) {
            settings.BIN_RULES.forEach(r => r.prefixes = []);
        }
        if (settings.TYPE_RULES) {
            settings.TYPE_RULES.forEach(r => r.prefixes = []);
        }
    }

    renderSettings();
});


document.getElementById('btn-run').addEventListener('click', async () => {
    if(!resolve) {
        document.getElementById('status-text').innerHTML = "❌ Not connected to DaVinci Resolve!";
        return;
    }
    
    let sfxEmpty = (!settings.SFX_PATH || settings.SFX_PATH.trim() === "");
    let musEmpty = (!settings.MUSIC_PATH || settings.MUSIC_PATH.trim() === "");
    if(sfxEmpty && musEmpty) {
        document.getElementById('status-text').innerHTML = "❌ Error: Choose Audio paths in Settings!";
        document.getElementById('error-modal-msg').innerHTML = "Please go to <strong>Settings &gt; 📂 Audio</strong> and enter your Master SFX Folder paths to analyze them!";
        document.getElementById('error-modal').style.display = 'flex';
        return;
    }
    
    let btn = document.getElementById('btn-run');
    btn.innerHTML = "⏳ Working...";
    btn.disabled = true;
    document.getElementById('status-text').innerHTML = "Organizing your files...";
    document.getElementById('progress-fill').style.width = "50%";
    
    setTimeout(() => {
        try {
            let startTime = performance.now();
            let count = runOrganize();
            let endTime = performance.now();
            let timeStr = ((endTime - startTime) / 1000).toFixed(1);
            document.getElementById('status-text').innerHTML = `✔ Finished Organizing ${count} clip${count === 1 ? '' : 's'} in ${timeStr}s!`;
            document.getElementById('progress-fill').style.width = "100%";
        } catch(e) {
            document.getElementById('status-text').innerHTML = "❌ Error: " + e.message;
            document.getElementById('error-modal-msg').innerHTML = "<strong>Error organizing files:</strong><br><br><span style='font-size:11px; color:#aaa; word-break:break-all;'>" + (e.stack ? e.stack.substring(0,150) + "..." : e.message) + "</span>";
            document.getElementById('error-modal').style.display = 'flex';
        }
        
        try {
            proj.SetSetting("colorScienceMode", proj.GetSetting("colorScienceMode"));
        } catch (err) {}
        
        btn.innerHTML = "▶ Organize Now";
        btn.disabled = false;
        
        setTimeout(() => {
            document.getElementById('progress-fill').style.width = "0%";
            document.getElementById('status-text').innerHTML = "Ready to Organize";
        }, 3000);
    }, 100);
});

function detectCamera(baseName, ext) {
    let f = baseName.toUpperCase();
    let e = ext.toLowerCase();
    let has = (arr, val) => arr.includes(val);

    // RED
    if (e === "r3d") return {brand:"RED", type:"video"};
    if (f.match(/^[A-Z]\d{3}_[A-Z]\d{3}_\d{4}[A-Z0-9]{2}_\d{3}/) && has(["mov","mp4","r3d"], e)) return {brand:"RED", type:"video"};

    // ARRI
    if (f.match(/^[A-Z]\d{3}C\d{3}_\d{6}_[A-Z0-9]{4}/) && has(["mxf","mov","ari","arx","arri"], e)) return {brand:"ARRI", type:"video"};
    if (has(["ari","arx","arri"], e)) return {brand:"ARRI", type:"video"};
    
    // Blackmagic Design
    if (e === "braw") return {brand:"Blackmagic", type:"video"};
    if (f.match(/^[A-Z]\d{3}_\d{8}(?:\s?[AP]M)?_[A-Z]\d{3}/) && has(["mov","mp4","braw","dng"], e)) return {brand:"Blackmagic", type: (e==="dng"?"image":"video")};
    if (f.match(/^[A-Z]\d{3}_\d{4,8}(?:\s?[AP]M)?_[A-Z]\d{3}/) && has(["mov","mp4","dng","braw"], e)) return {brand:"Blackmagic", type: (e==="dng"?"image":"video")};
    
    // Z CAM
    if (f.match(/^ZC\d{3}_/) && has(["mov","mp4","zraw"], e)) return {brand:"Z CAM", type:"video"};
    if (e === "zraw") return {brand:"Z CAM", type:"video"};

    // Kinefinity
    if (has(["cin","mkv"], e) && f.match(/^[0-9_A-Z]+$/)) {
        if (e === "cin" || e === "mkv") return {brand:"Kinefinity", type:"video"};
    }
    if (has(["cin","mkv"], e)) return {brand:"Kinefinity", type:"video"};

    // Phantom
    if (e === "cine") return {brand:"Phantom", type:"video"};
    
    // Hasselblad
    if (f.match(/^HASSELBLAD/i) || has(["3fr","fff"], e)) return {brand:"Hasselblad", type:"image"};

    // iPhone (Apple)
    if (f.match(/^IMG_\d{4,7}$/) && has(["mov", "hevc", "mp4"], e)) return {brand:"iPhone", type:"video"};
    if (f.match(/^IMG_\d{4,7}$/) && has(["heic", "heif", "png", "jpg", "jpeg"], e)) return {brand:"iPhone", type:"image"};

    // Canon
    if (f.match(/^[A-Z]\d{3}_C\d{3}/) && has(["mxf","crm"], e)) return {brand:"Canon", type:"video"};
    if (f.match(/^MVI_\d/) && has(["mp4","mov"], e)) return {brand:"Canon", type:"video"};
    if (f.match(/^IMG_\d{4}$/) && has(["cr2","cr3","jpg","jpeg"], e)) return {brand:"Canon", type:"image"};

    // GoPro
    if (f.match(/^(GX|GH)\d{2}/) && has(["mp4","360","lrv"], e)) return {brand:"GoPro", type:"video"};
    if (f.match(/^GOPR\d/)) {
        if (has(["mp4","lrv"], e)) return {brand:"GoPro", type:"video"};
        if (has(["jpg","jpeg","gpr"], e)) return {brand:"GoPro", type:"image"};
    }

    // Insta360
    if (f.match(/^(VID|LRV)_\d{8}_\d{6}_\d{2}_\d{3}/) && e === "insv") return {brand:"Insta360", type:"video"};
    if (f.match(/^IMG_\d{8}_\d{6}_\d{2}_\d{3}/) && has(["dng","insp"], e)) return {brand:"Insta360", type:"image"};

    // Android
    if (f.match(/^VID_\d{8}/) || f.match(/^20\d{6}_\d{6}/)) {
        if (has(["mp4"], e)) return {brand:"Android", type:"video"};
    }
    if (f.match(/^IMG_\d{8}/) || f.match(/^20\d{6}_\d{6}/) || f.match(/^SCREENSHOT_\d{8}-\d{6}/)) {
        if (has(["png","jpg","jpeg","dng"], e)) return {brand:"Android", type:"image"};
    }

    // Fujifilm
    if (f.match(/^FHD\d/) && has(["mov","mp4"], e)) return {brand:"Fujifilm", type:"video"};
    if (f.match(/^MOV_\d/) && has(["mov","mp4"], e)) return {brand:"Fujifilm", type:"video"};
    if (f.match(/^DSCF\d/) && has(["jpg","jpeg","raf"], e)) return {brand:"Fujifilm", type:"image"};

    // Olympus
    if (f.match(/^MOV\d/) && has(["mov","mp4"], e)) return {brand:"Olympus", type:"video"};
    if (e === "orf") return {brand:"Olympus", type:"image"};
    if (f.match(/^P[1-9A-C][0-3]\d{5}$/i) && has(["jpg","jpeg"], e)) return {brand:"Olympus", type:"image"};

    // Sony
    if (f.match(/^C\d{4}/) && has(["mp4","mxf","xavc"], e)) return {brand:"Sony", type:"video"};
    if (f.match(/^DSC\d{5}/) && has(["jpg","jpeg","arw"], e)) return {brand:"Sony", type:"image"};

    // Panasonic
    if (f.match(/^P\d{7}$/)) {
        if (has(["mp4","mov","mts"], e)) return {brand:"Panasonic", type:"video"};
        if (has(["jpg","jpeg","rw2"], e)) return {brand:"Panasonic", type:"image"};
    }
    
    // Nikon
    if (f.match(/^DSC_\d/)) {
        if (has(["jpg","jpeg","nef"], e)) return {brand:"Nikon", type:"image"};
        if (has(["mov","mp4"], e)) return {brand:"Nikon", type:"video"};
    }

    // DJI
    if (f.startsWith("DJI_")) {
        if (has(["mp4","mov"], e)) return {brand:"DJI", type:"video"};
        if (has(["jpg","jpeg","dng"], e)) return {brand:"DJI", type:"image"};
    }

    // Pentax
    if (f.match(/^IMGP\d/)) {
        if (has(["jpg","jpeg","pef","dng"], e)) return {brand:"Pentax", type:"image"};
        if (has(["mov","mp4"], e)) return {brand:"Pentax", type:"video"};
    }

    // Leica
    if (has(["mp4"], e) && f.match(/^L\d{7}$/)) return {brand:"Leica", type:"video"};
    if (has(["jpg","jpeg","dng"], e) && f.match(/^L\d{7}$/)) return {brand:"Leica", type:"image"};

    return null;
}

function runOrganize() {
    let pm = resolve.GetProjectManager();
    let proj = pm.GetCurrentProject();
    if (!proj) {
        console.error("No project is currently open in DaVinci Resolve.");
        try {
            document.getElementById('error-modal-msg').innerHTML = "<strong>Error: No project is currently open in DaVinci Resolve.</strong>";
            document.getElementById('error-modal').style.display = 'flex';
            let btn = document.getElementById('btn-run');
            if(btn) {
                btn.innerHTML = "✨ Organize Now";
                btn.disabled = false;
            }
        } catch(e) {}
        return;
    }
    let mp = proj.GetMediaPool();
    let root = mp.GetRootFolder();
    
    let opts = {
        groupExt: true,
        camera: settings.USE_CAMERA_FOLDERS !== false,
        empty: true,
        time: true,
        misc: true
    };
    
    let allClips = [];
    function getClips(folder, parentIsInIgnoreFolder = false) {
        let n = folder.GetName() || "";
        let lowerN = n.toLowerCase();
        
        let hasIgnoreFolders = settings.IGNORE_FOLDERS && settings.IGNORE_FOLDERS.length > 0;
        let hasIgnoreClips = settings.IGNORE_CLIPS && settings.IGNORE_CLIPS.length > 0;
        
        let isInIgnoreFolder = parentIsInIgnoreFolder;
        if(hasIgnoreFolders && !isInIgnoreFolder) {
            settings.IGNORE_FOLDERS.forEach(ign => {
                if(ign.trim() !== "" && lowerN.includes(ign.toLowerCase().trim())) {
                    isInIgnoreFolder = true;
                }
            });
        }
        
        // If it's an ignored folder and NO clip names are specified, ignore the entire folder.
        if(isInIgnoreFolder && !hasIgnoreClips) return;
        
        let clipsObj = folder.GetClipList() || {};
        let clips = Object.values(clipsObj);
        clips.forEach(c => {
            let cname = c.GetClipProperty("Clip Name") || "";
            let lowerCName = cname.toLowerCase();
            let cType = c.GetClipProperty("Type") || "";
            
            let ignoreClip = false;
            if (cType.toLowerCase() !== "timeline") {
                if (hasIgnoreClips) {
                    // If Main Folders are specified, ONLY ignore the clips if they are INSIDE those folders.
                    // If no Main Folders are specified, ignore the clips everywhere.
                    if (!hasIgnoreFolders || isInIgnoreFolder) {
                        settings.IGNORE_CLIPS.forEach(ign => {
                            if(ign.trim() !== "" && lowerCName.startsWith(ign.toLowerCase().trim())) {
                                ignoreClip = true;
                            }
                        });
                    }
                }
            }
            
            if(!ignoreClip) {
                allClips.push({clip: c, folder: folder});
            }
        });
        
        let subsObj = folder.GetSubFolderList() || {};
        let subs = Object.values(subsObj);
        subs.forEach(s => getClips(s, isInIgnoreFolder));
    }
    getClips(root);
    
    let createdFolders = {};
    let rootSubs = Object.values(root.GetSubFolderList() || {});
    rootSubs.forEach(s => { createdFolders["root/" + s.GetName()] = s; });
    
    function getOrCreateBin(parentWrapper, name) {
        let key = parentWrapper.path + "/" + name;
        if(!createdFolders[key]) {
            let existingSubs = Object.values(parentWrapper.folder.GetSubFolderList() || {});
            let found = existingSubs.find(s => s.GetName() === name);
            if (found) {
                createdFolders[key] = found;
            } else {
                createdFolders[key] = mp.AddSubFolder(parentWrapper.folder, name);
            }
        }
        return { folder: createdFolders[key], path: key };
    }
    
    let rootWrapper = { folder: root, path: "root" };
    
    let dynAudio = "📂 Audio", dynVideo = "📂 Video", dynImages = "📂 Images", dynSRT = "📂 SRT";
    let dynFusion = "📂 Fusion", dynCompound = "📂 Compound Clips", dynTimelines = "📂 Timelines";
    settings.BIN_RULES.forEach(r => {
        if(r.exts.includes("mp3")) dynAudio = r.bin;
        if(r.exts.includes("mp4")) dynVideo = r.bin;
        if(r.exts.includes("jpg")) dynImages = r.bin;
        if(r.exts.includes("srt")) dynSRT = r.bin;
    });
    settings.TYPE_RULES.forEach(r => {
        if(r.types.some(t => t.toLowerCase() === "fusion clip")) dynFusion = r.bin;
        if(r.types.some(t => t.toLowerCase() === "compound clip")) dynCompound = r.bin;
        if(r.types.some(t => t.toLowerCase() === "timeline")) dynTimelines = r.bin;
    });
    
    allClips.forEach(item => {
        let clip = item.clip;
        let parent = item.folder;
        
        let cStatus = "";
        let cOffline = "";
        try { cStatus = clip.GetClipProperty("Online Status") || ""; } catch (e) {}
        try { cOffline = clip.GetClipProperty("Offline") || ""; } catch (e) {}
        
        if (settings.ORGANIZE_OFFLINE && (cStatus.toLowerCase().includes("offline") || String(cOffline) === "1" || String(cOffline).toLowerCase() === "true")) {
            let offlineBin = getOrCreateBin(rootWrapper, "📂 Offline Files");
            if (parent.GetName() !== "📂 Offline Files") {
                mp.MoveClips([clip], offlineBin.folder);
            }
            if (settings.ENABLE_CLIP_COLORS) clip.SetClipColor("Red");
            return;
        }
        
        // Let it process inside ANY folder so it can fix the ones dumped in root by the buggy code!
        
        let cName = clip.GetClipProperty("Clip Name") || "";
        let cType = clip.GetClipProperty("Type") || "";
        let fPath = clip.GetClipProperty("File Path") || cName || ""; // Fallback to cName to catch extension if File Path missing!
        
        let targetName = null;
        let ext = "";
        if(fPath !== "") {
            let match = fPath.match(/\.([^.]+)$/);
            if(match) ext = match[1].toLowerCase();
            
            let normFilePath = fPath.replace(/\\/g, '/').toLowerCase();
            if (settings.SFX_PATH && settings.SFX_PATH.trim() !== "" && normFilePath.startsWith(settings.SFX_PATH.replace(/\\/g, '/').toLowerCase() + (settings.SFX_PATH.endsWith('/') || settings.SFX_PATH.endsWith('\\') ? '' : '/'))) {
                targetName = dynAudio;
            } else if (settings.MUSIC_PATH && settings.MUSIC_PATH.trim() !== "" && normFilePath.startsWith(settings.MUSIC_PATH.replace(/\\/g, '/').toLowerCase() + (settings.MUSIC_PATH.endsWith('/') || settings.MUSIC_PATH.endsWith('\\') ? '' : '/'))) {
                targetName = dynAudio;
            } else {
                let customMasters = settings.CUSTOM_MASTER_FOLDERS || [];
                let matchedMaster = customMasters.find(m => m.path.trim() !== "" && normFilePath.includes(m.path.replace(/\\/g, '/').toLowerCase()));
                if (matchedMaster) targetName = matchedMaster.targetBin;
            }
        }
        
        // 1. Types (Timelines, Compound, etc)
        if(opts.time && !targetName) {
            for(let r of settings.TYPE_RULES) {
                if(r.types.some(t => cType.toLowerCase().includes(t.toLowerCase()))) { targetName = r.bin; break; }
            }
            if(!targetName) {
                if(cType.toLowerCase().includes("fusion")) targetName = dynFusion;
                else if(cType.toLowerCase().includes("compound")) targetName = dynCompound;
            }
        }
        
        // 2. Camera Detect
        let camBrand = null;
        if(!targetName && opts.camera && ext !== "") {
            let fn = fPath.split(/[\/\\]/).pop() || cName;
            let bn = fn.match(/^(.+)\.[^.]+$/) ? fn.match(/^(.+)\.[^.]+$/)[1] : fn;
            let cam = detectCamera(bn, ext);
            if(cam) {
                camBrand = cam.brand;
                targetName = (cam.type === "video") ? dynVideo : dynImages;
            }
        }

        // 3. Extensions
        if(!targetName && ext !== "") {
            let isStrictAudio = cType.toLowerCase() === "audio";
            for(let r of settings.BIN_RULES) {
                if(r.exts.includes(ext)) { 
                    if(isStrictAudio && r.bin === dynVideo) {
                        targetName = dynAudio;
                    } else {
                        targetName = r.bin; 
                    }
                    break; 
                }
            }
        }
        
        // Fallback for when extensions are turned off or not matched
        let fellToFallback = false;
        if(!targetName) {
            if(cType.toLowerCase().includes("video")) { targetName = dynVideo; fellToFallback = true; }
            else if(cType.toLowerCase().includes("audio")) { targetName = dynAudio; fellToFallback = true; }
            else if(cType.toLowerCase().includes("image")) { targetName = dynImages; fellToFallback = true; }
        }
        
        if(!targetName && opts.misc) targetName = settings.BIN_MISC;
        
        let targetRule = targetName ? (settings.BIN_RULES.find(r => r.bin === targetName) || settings.TYPE_RULES.find(r => r.bin === targetName)) : null;
        let isFallback = (targetRule && targetRule.useExt === false) || fellToFallback;
        
        let matchedPrefix = null;
        if (targetRule && targetRule.usePrefixes !== false && targetRule.prefixes && targetRule.prefixes.length > 0) {
            let lowerName = cName.toLowerCase();
            matchedPrefix = targetRule.prefixes.find(p => lowerName.startsWith(p.toLowerCase()));
        }
        
        if(targetName) {
            let destBin = getOrCreateBin(rootWrapper, targetName);
            let finalColor = settings.BIN_COLORS[targetName];
            let finalFlag = settings.BIN_FLAGS[targetName];
            
            if (targetName === dynFusion && cType && cType.trim() !== "") {
                let subName = cType.trim();
                // Capitalize first letter of each word
                subName = subName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                if (subName.toLowerCase() === "fusion") {
                    subName = "Fusion Clip";
                }
                
                let colorKey = Object.keys(settings.BIN_COLORS).find(k => k.toLowerCase() === subName.toLowerCase());
                if (colorKey) finalColor = settings.BIN_COLORS[colorKey];
                
                let flagKey = Object.keys(settings.BIN_FLAGS).find(k => k.toLowerCase() === subName.toLowerCase());
                if (flagKey) finalFlag = settings.BIN_FLAGS[flagKey];
            }
            
            if (matchedPrefix) {
                destBin = getOrCreateBin(destBin, matchedPrefix);
                if (targetRule.prefixColor && targetRule.prefixColor !== "None") {
                    finalColor = targetRule.prefixColor;
                }
            }
            
            if (targetName === dynTimelines && (settings.ANALYZE_TIMELINES || settings.ANALYZE_TIMELINE_RES || settings.ANALYZE_TIMELINE_FPS)) {
                let resStr = clip.GetClipProperty("Resolution");
                let fpsStr = clip.GetClipProperty("FPS");
                
                if (settings.ANALYZE_TIMELINES || settings.ANALYZE_TIMELINE_RES) {
                    if (resStr && typeof resStr === "string" && resStr.includes("x")) {
                        let parts = resStr.split("x");
                        let w = parseInt(parts[0]);
                        let h = parseInt(parts[1]);
                        if (!isNaN(w) && !isNaN(h)) {
                            let isStandard = [
                                "1920x1080", "1080x1920", "1080x1080", "1080x1350", "1350x1080",
                                "3840x2160", "2160x3840", "2160x2160", "3840x1600", "1920x800",
                                "4096x2160", "2160x4096", "2048x1080", "1080x2048",
                                "1280x720", "720x1280", "720x480", "480x720", "720x576", "576x720",
                                "7680x4320", "4320x7680", "2560x1440", "1440x2560"
                            ].includes(w + "x" + h);
                            
                            let sizeWasCustom = false;
                            
                            if (settings.ANALYZE_TIMELINES) {
                                let subName = "";
                                if (w === h) {
                                    subName = "Square";
                                } else if (!isStandard) {
                                    subName = "Custom";
                                    sizeWasCustom = true;
                                } else if (w > h) {
                                    subName = "Horizontal";
                                } else {
                                    subName = "Vertical";
                                }
                                
                                destBin = getOrCreateBin(destBin, subName);
                                
                                let colorKey = Object.keys(settings.BIN_COLORS).find(k => k.toLowerCase() === subName.toLowerCase());
                                if (colorKey) finalColor = settings.BIN_COLORS[colorKey];
                                
                                let flagKey = Object.keys(settings.BIN_FLAGS).find(k => k.toLowerCase() === subName.toLowerCase());
                                if (flagKey) finalFlag = settings.BIN_FLAGS[flagKey];
                            }
                            
                            if (settings.ANALYZE_TIMELINE_RES) {
                                let resName = "";
                                let maxDim = Math.max(w, h);
                                if (maxDim < 1280) resName = "SD";
                                else if (maxDim < 1920) resName = "HD";
                                else if (maxDim < 2048) resName = "FHD";
                                else if (maxDim < 3840) resName = "2K";
                                else if (maxDim < 7680) resName = "4K";
                                else resName = "8K";
                                
                                destBin = getOrCreateBin(destBin, resName);
                                
                                let colorKey = Object.keys(settings.BIN_COLORS).find(k => k.toLowerCase() === resName.toLowerCase());
                                if (colorKey) finalColor = settings.BIN_COLORS[colorKey];
                                
                                let flagKey = Object.keys(settings.BIN_FLAGS).find(k => k.toLowerCase() === resName.toLowerCase());
                                if (flagKey) finalFlag = settings.BIN_FLAGS[flagKey];
                            }
                        }
                    }
                }
                
                if (settings.ANALYZE_TIMELINE_FPS && fpsStr !== undefined && fpsStr !== null) {
                    let fpsVal = parseFloat(fpsStr);
                    if (!isNaN(fpsVal)) {
                        let fpsName = String(fpsStr).trim() + "fps";
                        destBin = getOrCreateBin(destBin, fpsName);
                        
                        let colorKey = Object.keys(settings.BIN_COLORS).find(k => k.toLowerCase() === fpsName.toLowerCase());
                        if (colorKey) finalColor = settings.BIN_COLORS[colorKey];
                        
                        let flagKey = Object.keys(settings.BIN_FLAGS).find(k => k.toLowerCase() === fpsName.toLowerCase());
                        if (flagKey) finalFlag = settings.BIN_FLAGS[flagKey];
                    }
                }
            }
            
            if(camBrand) {
                let rawBin = getOrCreateBin(destBin, "Camera Raw");
                destBin = getOrCreateBin(rawBin, camBrand);
                finalColor = settings.BIN_COLORS[camBrand];
                finalFlag = settings.BIN_FLAGS[camBrand];
                
                if (settings.MIRROR_HARD_DRIVE === true && fPath !== "") {
                    let normPath = fPath.replace(/\\/g, '/');
                    let parts = normPath.split('/');
                    if (parts.length > 1) {
                        let parentFolder = parts[parts.length - 2];
                        if (parentFolder && parentFolder.trim() !== "") {
                            let pLower = parentFolder.toLowerCase();
                            let cLower = camBrand.toLowerCase();
                            // Prevent redundant folders like Sony -> Sony
                            if (pLower !== cLower && pLower !== "camera raw" && pLower !== "video") {
                                destBin = getOrCreateBin(destBin, parentFolder);
                            }
                        }
                    }
                }
            } else {
                let isSFX = false;
                let isMusic = false;
                let isCustomMaster = false;
                let matchedMaster = null;
                if(targetName === dynAudio) {
                    if (settings.SFX_PATH && settings.SFX_PATH.trim() !== "") {
                        let normSfxPath = settings.SFX_PATH.replace(/\\/g, '/').toLowerCase();
                        let normFilePath = fPath.replace(/\\/g, '/').toLowerCase();
                        if (normFilePath.includes(normSfxPath)) isSFX = true;
                    }
                    if (!isSFX && settings.MUSIC_PATH && settings.MUSIC_PATH.trim() !== "") {
                        let normMusPath = settings.MUSIC_PATH.replace(/\\/g, '/').toLowerCase();
                        let normFilePath = fPath.replace(/\\/g, '/').toLowerCase();
                        if (normFilePath.includes(normMusPath)) isMusic = true;
                    }
                }
                
                if(!isSFX && !isMusic) {
                    let customMasters = settings.CUSTOM_MASTER_FOLDERS || [];
                    matchedMaster = customMasters.find(m => {
                        return m.targetBin === targetName && m.path.trim() !== "" && fPath.replace(/\\/g, '/').toLowerCase().includes(m.path.replace(/\\/g, '/').toLowerCase());
                    });
                    if(matchedMaster) isCustomMaster = true;
                }
                
                if(isSFX || isMusic || isCustomMaster) {
                    let typeName = isCustomMaster ? matchedMaster.name : (isSFX ? "SFX" : "Music");
                    let masterPath = isCustomMaster ? matchedMaster.path : (isSFX ? settings.SFX_PATH : settings.MUSIC_PATH);
                    let defaultCol = isCustomMaster ? (matchedMaster.color || "None") : (isSFX ? (settings.SFX_COLOR || "None") : (settings.MUSIC_COLOR || "None"));
                      if (defaultCol === "None" && settings.BIN_COLORS[dynAudio]) defaultCol = settings.BIN_COLORS[dynAudio];
                    let defaultFlag = isCustomMaster ? (matchedMaster.flag || "None") : (isSFX ? (settings.SFX_FLAG || "None") : (settings.MUSIC_FLAG || "None"));
                    
                    finalColor = defaultCol;
                    finalFlag = defaultFlag;
                    
                    destBin = getOrCreateBin(destBin, typeName);
                    
                    let subName = "";
                    let normMaster = masterPath.replace(/\\/g, '/').toLowerCase();
                    let normFile = fPath.replace(/\\/g, '/').toLowerCase();
                    
                    if (normFile.includes(normMaster)) {
                        let isMutedVideo = false;
                        if (isCustomMaster && matchedMaster.noSound && cType.toLowerCase().includes("video")) {
                            let audioCh = "";
                            try { audioCh = clip.GetClipProperty("Audio Ch"); } catch (e) {}
                            if (!audioCh || String(audioCh).trim() === "" || String(audioCh).trim() === "0") {
                                isMutedVideo = true;
                            }
                        }
                        
                        let idx = normFile.indexOf(normMaster);
                        let remainder = fPath.substring(idx + normMaster.length);
                        let parts = remainder.split(/[\/\\]/).filter(p => p.length > 0);
                        if (parts.length > 1) {
                            parts.pop(); // Remove the file name itself
                            let isDeep = false;
                            if (isCustomMaster) {
                                isDeep = matchedMaster.deepScan !== false;
                            } else if (isSFX) {
                                isDeep = settings.SFX_DEEP_SCAN !== false;
                            } else if (isMusic) {
                                isDeep = settings.MUSIC_DEEP_SCAN !== false;
                            }
                            
                            if (isDeep) {
                                parts.forEach(p => {
                                    destBin = getOrCreateBin(destBin, p);
                                    let colorKey = Object.keys(settings.BIN_COLORS).find(k => k.toLowerCase() === p.toLowerCase());
                                    if(colorKey) finalColor = settings.BIN_COLORS[colorKey];
                                    let flagKey = Object.keys(settings.BIN_FLAGS).find(k => k.toLowerCase() === p.toLowerCase());
                                    if(flagKey) finalFlag = settings.BIN_FLAGS[flagKey];
                                });
                            } else {
                                subName = parts[0];
                                destBin = getOrCreateBin(destBin, subName);
                                let colorKey = Object.keys(settings.BIN_COLORS).find(k => k.toLowerCase() === subName.toLowerCase());
                                if(colorKey) finalColor = settings.BIN_COLORS[colorKey];
                                let flagKey = Object.keys(settings.BIN_FLAGS).find(k => k.toLowerCase() === subName.toLowerCase());
                                if(flagKey) finalFlag = settings.BIN_FLAGS[flagKey];
                            }
                        }
                        
                        if (isMutedVideo) {
                            destBin = getOrCreateBin(destBin, "No Sound");
                        }
                    } else if(opts.groupExt && ext !== "" && !isFallback) {
                        destBin = getOrCreateBin(destBin, ext.toUpperCase());
                        finalColor = defaultCol;
                        finalFlag = defaultFlag;
                    } else if (opts.groupExt && isFallback) {
                        let base = targetName.replace(/^[^a-zA-Z0-9]+/, "").trim() || "File";
                        let subName = base + "_EB";
                        destBin = getOrCreateBin(destBin, subName);
                        finalColor = defaultCol;
                        finalFlag = defaultFlag;
                    } else {
                        finalColor = defaultCol;
                        finalFlag = defaultFlag;
                    }
                } else {
                    if(opts.groupExt && ext !== "" && targetName !== dynSRT && !isFallback) {
                          destBin = getOrCreateBin(destBin, ext.toUpperCase());
                          if (targetRule && targetRule.extColor && targetRule.extColor !== "None") {
                              finalColor = targetRule.extColor;
                          }
                      } else if(opts.groupExt && isFallback) {
                        let base = targetName.replace(/^[^a-zA-Z0-9]+/, "").trim() || "File";
                        let subName = base + "_EB";
                        destBin = getOrCreateBin(destBin, subName);
                    } else if(opts.camera && (targetName === dynVideo || targetName === dynImages)) {
                        destBin = getOrCreateBin(destBin, "Not From Camera");
                    }
                }
            }
            
            if(destBin) {
                mp.MoveClips([clip], destBin.folder);
                
                if(settings.ENABLE_CLIP_COLORS && finalColor && finalColor !== "None") {
                    clip.SetClipColor(finalColor);
                    if(destBin.folder.SetColor) {
                        try { destBin.folder.SetColor(finalColor); } catch(e) {}
                    }
                } else {
                    if(clip.ClearClipColor) clip.ClearClipColor();
                    if(destBin.folder.SetColor) {
                        try { destBin.folder.SetColor("None"); } catch(e) {}
                    }
                }
                
                if(settings.ENABLE_FLAGS && finalFlag && finalFlag !== "None") {
                    clip.AddFlag(finalFlag);
                } else {
                    if(clip.ClearFlags) clip.ClearFlags("All");
                }
            }
        }
    });
    
    if(opts.empty) {
        let emptyCheck = Object.values(root.GetSubFolderList() || {});
        function removeEmpty(folder, isRoot) {
            let n = folder.GetName() || "";
            let lowerN = n.toLowerCase();
            
            let ignoreFolder = false;
            if(settings.IGNORE_FOLDERS) {
                settings.IGNORE_FOLDERS.forEach(ign => {
                    if(ign.trim() !== "" && lowerN.includes(ign.toLowerCase().trim())) {
                        ignoreFolder = true;
                    }
                });
            }
            if(ignoreFolder) return false;
            
            
            let subs = Object.values(folder.GetSubFolderList() || {});
            let toDelete = [];
            subs.forEach(s => {
                if (removeEmpty(s, false)) {
                    toDelete.push(s);
                }
            });
            
            if (toDelete.length > 0) {
                try { mp.DeleteFolders(toDelete); } catch(e) {}
            }
            
            if(!isRoot) {
                let curSubs = Object.values(folder.GetSubFolderList() || {});
                let curClips = Object.values(folder.GetClipList() || {});
                if(curSubs.length === 0 && curClips.length === 0) {
                    return true;
                }
            }
            return false;
        }
        emptyCheck.forEach(s => removeEmpty(s, false));
    }
    return allClips.length;
}
document.getElementById('btn-error-ok').addEventListener('click', () => {
    document.getElementById('error-modal').style.display = 'none';
});

function buildFolderTree(items, rootVal) {
    const path = require('path');
    let tree = {};
    for(let item of items) {
        if(item.isDirectory()) {
            let rel = path.relative(rootVal, item.parentPath || item.path);
            let relPath = rel === '' ? item.name : rel.replace(/\\/g, '/') + '/' + item.name;
            let parts = relPath.split('/');
            
            let current = tree;
            for(let part of parts) {
                if(!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            }
        }
    }
    return tree;
}

function renderFolderTree(nodeObj, parentEl, prefix, depth = 0) {
    let keys = Object.keys(nodeObj).sort();
    if(keys.length === 0) return;
    
    keys.forEach(k => {
        let children = nodeObj[k];
        let hasChildren = Object.keys(children).length > 0;
        
        if (depth === 0) {
            let details = document.createElement('details');
            details.style.marginBottom = '5px';
            details.style.background = 'var(--bg-dark)';
            details.style.borderRadius = '4px';
            details.style.padding = '2px';
            
            let summary = document.createElement('summary');
            summary.style.display = 'flex';
            summary.style.alignItems = 'center';
            summary.style.justifyContent = 'space-between';
            summary.style.fontSize = '13px'; // Standardized size
            summary.style.color = 'white';
            summary.style.cursor = 'pointer';
            summary.style.outline = 'none';
            summary.style.userSelect = 'none';
            summary.style.padding = '8px';
            
            let summTitle = document.createElement('span');
            summTitle.className = 'summ-title-text';
            summTitle.dataset.name = k;
            if(hasChildren) summTitle.dataset.expandable = 'true';
            summTitle.innerHTML = (hasChildren ? '▶ ' : '&nbsp;&nbsp; ') + k;
            summTitle.style.fontWeight = '600'; // Standardized weight
            
            details.addEventListener('toggle', () => {
                if (summary.style.listStyle !== 'none') {
                    summTitle.innerHTML = (details.open ? '▼ ' : '▶ ') + k;
                }
            });
            
            let topCSel = createColorPicker(settings.BIN_COLORS[k] || "None", "clip-color-picker " + prefix + "-subfolder-color-sel", "folder", k);
            let topFSel = createColorPicker(settings.BIN_FLAGS[k] || "None", "flag-color-picker " + prefix + "-subfolder-flag-sel", "folder", k, flagHexColors);
            let topFlex = document.createElement('div');
            topFlex.style.display = 'flex'; topFlex.style.gap = '5px';
            topFlex.appendChild(topCSel); topFlex.appendChild(topFSel);
            topFlex.onclick = (e) => e.stopPropagation();
            
            summary.appendChild(summTitle);
            summary.appendChild(topFlex);
            details.appendChild(summary);
            
            if(hasChildren) {
                let grid = document.createElement('div');
                grid.style.display = 'flex';
                grid.style.flexDirection = 'column';
                grid.style.gap = '4px';
                grid.style.marginTop = '8px';
                grid.style.padding = '0 12px 12px 15px';
                grid.style.borderLeft = '1px solid var(--border)';
                grid.style.marginLeft = '8px';
                
                renderFolderTree(children, grid, prefix, depth + 1);
                details.appendChild(grid);
            } else {
                summary.style.listStyle = 'none';
            }
            parentEl.appendChild(details);
            
        } else {
            let rowType = hasChildren ? 'details' : 'div';
            let crow = document.createElement(rowType);
            crow.style.marginBottom = '4px';
            
            let summary = hasChildren ? document.createElement('summary') : crow;
            if(hasChildren) {
                summary.style.display = 'flex';
                summary.style.alignItems = 'center';
                summary.style.justifyContent = 'space-between';
                summary.style.cursor = 'pointer';
                summary.style.background = 'var(--bg)';
                summary.style.padding = '8px';
                summary.style.borderRadius = '4px';
                summary.style.outline = 'none';
                summary.style.userSelect = 'none';
                summary.style.listStyle = 'none';
                summary.style.fontSize = '13px'; // Standardized size
            } else {
                crow.className = 'camera-row';
                crow.style.background = 'var(--bg)';
                crow.style.fontSize = '13px'; // Standardized size
            }
            
            let labelDiv = document.createElement('div');
            labelDiv.style.display = 'flex';
            labelDiv.style.flexDirection = 'column';
            
            let cname = document.createElement('span');
            cname.className = 'summ-title-text';
            cname.dataset.name = k;
            if(hasChildren) cname.dataset.expandable = 'true';
            cname.innerHTML = (hasChildren ? '▶ ' : '') + k;
            cname.style.fontWeight = "600"; // Standardized weight
            cname.style.fontSize = '13px'; // Standardized size
            
            let csub = document.createElement('span');
            csub.innerHTML = `Level ${depth + 1} Folder`;
            csub.style.fontSize = "10px";
            csub.style.color = "var(--text-dim)";
            csub.style.marginTop = "2px";
            
            labelDiv.appendChild(cname);
            labelDiv.appendChild(csub);
            
            let csel = createColorPicker(settings.BIN_COLORS[k] || "None", "clip-color-picker " + prefix + "-subfolder-color-sel", "folder", k);
            let fsel = createColorPicker(settings.BIN_FLAGS[k] || "None", "flag-color-picker " + prefix + "-subfolder-flag-sel", "folder", k, flagHexColors);
            let flexColor = document.createElement('div');
            flexColor.style.display = 'flex'; flexColor.style.gap = '5px';
            flexColor.appendChild(csel); flexColor.appendChild(fsel);
            flexColor.onclick = (e) => e.stopPropagation();
            
            if(hasChildren) {
                summary.appendChild(labelDiv);
                summary.appendChild(flexColor);
                crow.appendChild(summary);
                
                crow.addEventListener('toggle', () => {
                    cname.innerHTML = (crow.open ? '▼ ' : '▶ ') + k;
                });
                
                let childCont = document.createElement('div');
                childCont.style.paddingLeft = '15px';
                childCont.style.borderLeft = '1px solid var(--border)';
                childCont.style.marginLeft = '8px';
                childCont.style.marginTop = '4px';
                
                renderFolderTree(children, childCont, prefix, depth + 1);
                crow.appendChild(childCont);
            } else {
                crow.appendChild(labelDiv);
                crow.appendChild(flexColor);
            }
            parentEl.appendChild(crow);
        }
    });
}

// --- Remote Trial Auth ---
const REMOTE_AUTH_URL = "https://raw.githubusercontent.com/alokwebsite/t/main/T.txt";

async function checkRemoteAuth() {
    let loadingCard = document.getElementById('auth-loading-card');
    let lockedCard = document.getElementById('auth-locked-card');
    let organizeCard = document.getElementById('organize-card');
    let header = document.querySelector('header');
    let footer = document.querySelector('footer');

    // Hide UI initially
    if(header) header.style.display = 'none';
    if(footer) footer.style.display = 'none';
    
    try {
        let response = await fetch(REMOTE_AUTH_URL + "?t=" + Date.now(), { cache: "no-store", method: "GET" });
        if (!response.ok) {
            throw new Error("Failed to fetch");
        }
        let text = await response.text();
        let authValue = text.trim();
        
        if (authValue === "1") {
            // Unlock plugin
            if(loadingCard) loadingCard.style.display = 'none';
            if(lockedCard) lockedCard.style.display = 'none';
            if(organizeCard) organizeCard.style.display = 'block';
            if(header) header.style.display = 'flex';
            if(footer) footer.style.display = 'block';
        } else {
            // Lock plugin (value 0 or anything else)
            if(loadingCard) loadingCard.style.display = 'none';
            if(lockedCard) lockedCard.style.display = 'flex';
        }
    } catch(e) {
        // Offline or request blocked -> Lock plugin
        if(loadingCard) loadingCard.style.display = 'none';
        if(lockedCard) lockedCard.style.display = 'flex';
    }
}

// Check auth on startup
setTimeout(checkRemoteAuth, 50);


