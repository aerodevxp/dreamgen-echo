const { app, BrowserWindow, dialog, screen, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let menuBarVisible = true;

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
        submenu :[
            {
                label: 'Toggle Custom CSS',
                click: () => {
                    dialog.showMessageBox(mainWindow, {
                        type: 'warning',
                        buttons: ['Okay :)!'],
                        title: 'Not Finished',
                        message: 'This feature is will a WIP! Please stay tuned for the next update on GitHub.'
                      });
                }
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
    
    mainWindow.on('closed', () => {
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
