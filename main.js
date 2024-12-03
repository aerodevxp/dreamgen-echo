const { app, BrowserWindow, dialog, screen, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const config = require('./config/settings.json');

let mainWindow;
let menuBarVisible = true;
let cssMods = {
    "theme" : [true, config['CSSMODS']['themes'][config['currentTheme']]],
    "betterScaling" : [config['isBetterScaling'], config['CSSMODS']['betterScaling']]
}


// Window Creation
//====================

const menuTemplate = [
    {
      label: 'App',
      submenu: [
        {
            label: 'Refresh',
            accelerator: 'F5',
            click: () => {
              mainWindow.reload();
            }
        },
        {
            label: 'Fullscreen',
            accelerator: 'F11',
            click: () => {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
        },
        {
            label: 'Toggle DevTools',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              mainWindow.webContents.toggleDevTools();
            }
        },
        {
            label: 'Toggle Menu Bar',
            accelerator: 'ESC',
            click: () => {
                menuBarVisible = !menuBarVisible;
                mainWindow.setAutoHideMenuBar(menuBarVisible);
                mainWindow.setMenuBarVisibility(!menuBarVisible);
            }
        },
        {
            label: 'Leave',
            accelerator: 'Alt+F4',
            click: () => {
              app.quit();
            }
        }
      ]
    },
    {
      label: 'Text',
      submenu: [
        {
          label: 'Undo',
          role: 'undo'
        },
        {
          label: 'Redo',
          role: 'redo'
        },
        {
          label: 'Cut',
          role: 'cut'
        },
        {
          label: 'Copy',
          role: 'copy'
        },
        {
          label: 'Paste',
          role: 'paste'
        }
      ]
    },
    {
        label: 'Style',
        submenu: [
            {
                label: 'Custom CSS',
                submenu: [
                    {
                        label: 'Toggle Custom CSS',
                        type: 'checkbox',
                        checked: config['isCustomCSS'],
                        click: (menuItem) => {
                            config.isCustomCSS = menuItem.checked;
                            mainWindow.reload();
                        }
                    },
                    {
                        label: 'Edit Custom CSS',
                        checked: config['isCustomCSS'],
                        click: (menuItem) => {
                            //open input box
                            const editCSSWindow = new BrowserWindow({
                                width: 600,
                                height: 400,
                                parent: mainWindow,
                                modal: true,
                                show: false,
                                webPreferences: {
                                    nodeIntegration: true,
                                    contextIsolation: false,
                                }
                            });

                            editCSSWindow.loadFile('./cssinput.html');

                            editCSSWindow.once('ready-to-show', () => {
                                editCSSWindow.show();
                            });

                            ipcMain.once('custom-css-submitted', (event, css) => {
                                config.customCSS = css;
                                editCSSWindow.close();
                                mainWindow.reload();
                            });
                        }
                        
                    }
                ]
            },
          
            {
                label: 'Themes',
                submenu:[
                    {
                        label: 'Default',
                        type: 'radio',
                        checked: config["currentTheme"] == 0,
                        click: () => {
                            config['currentTheme'] = 0;
                            cssMods['theme'] = [true, config['CSSMODS']['themes'][config['currentTheme']]];
                            mainWindow.reload();
                        }
                    },
                    {
                        label: 'Lavender',
                        type: 'radio',
                        checked: config["currentTheme"] == 1,
                        click: () => {
                            config['currentTheme'] = 1;
                            cssMods['theme'] = [true, config['CSSMODS']['themes'][config['currentTheme']]];
                            mainWindow.reload();
                        }
                    },
                    {
                        label: 'High Contrast',
                        type: 'radio',
                        checked: config["currentTheme"] == 2,
                        click: () => {
                            config['currentTheme'] = 2;
                            cssMods['theme'] = [true, config['CSSMODS']['themes'][config['currentTheme']]];
                            mainWindow.reload();
                        }
                    }
                ]
            },
            {
                label: 'Little Fixes',
                submenu:[
                    {
                        label: 'Scaling Fixes for RP/Sandbox',
                        type: 'checkbox',
                        checked: cssMods['betterScaling'][0],
                        click: (menuItem) => {
                            config['isBetterScaling'] = menuItem.checked;
                            cssMods['betterScaling'][0] = menuItem.checked;
                            mainWindow.reload();
                        }
                    }
                ]
            }
        ]
    }
  ];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: path.join(__dirname, 'img/icon.png'),
        webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        },
        frame: true,
        transparent: false,
        resizable: true,
    });

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    mainWindow.setAutoHideMenuBar(false);
    mainWindow.setMenuBarVisibility(true);

    mainWindow.loadURL('https://dreamgen.com/app/');
    injectCustomCSS();
    mainWindow.on('closed', () => {
        try {
            fs.writeFileSync('./config/settings.json', JSON.stringify(config, null, 2), 'utf-8');
            console.log('Config updated successfully');
          } catch (err) {
            console.error('Error writing config file:', err);
          }
        mainWindow = null;
    });
}

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Functions for features
//====================

//Inject Custom CSS
function injectCustomCSS(){
    let custom_css = config['customCSS']
    mainWindow.webContents.on('did-finish-load', () => {
        if(config.isCustomCSS){
            mainWindow.webContents.insertCSS(custom_css);
            console.log('Loading Custom CSS...');
        }
        Object.entries(cssMods).forEach(mod => {
            if (mod[1][0]){mainWindow.webContents.insertCSS(mod[1][1]);}
            console.log(`Inserting ${mod[0]} CSS!`);
        });
    });
}
