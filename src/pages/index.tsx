import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DigitalClock } from '@/components/blocks/digital-clock';

const WinXPDesktop: React.FC = () => {
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const desktopIcons = [
    { id: 'mycomputer', name: 'My Computer', icon: 'https://i.imgur.com/hDYBOxo.png' },
    { id: 'mydocuments', name: 'My Documents', icon: 'https://i.imgur.com/4QhUGFJ.png' },
    { id: 'recyclebin', name: 'Recycle Bin', icon: 'https://i.imgur.com/OBqaVji.png' },
    { id: 'internetexplorer', name: 'Internet Explorer', icon: 'https://i.imgur.com/VA8RCtI.png' },
  ];

  const openWindow = (id: string) => {
    setActiveWindow(id);
    setStartMenuOpen(false);
  };

  const toggleStartMenu = () => {
    setStartMenuOpen(!startMenuOpen);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Desktop Icons */}
      <div className="grid grid-cols-1 gap-4 p-4">
        {desktopIcons.map((icon) => (
          <div
            key={icon.id}
            className="desktop-icon"
            onDoubleClick={() => openWindow(icon.id)}
          >
            <img src={icon.icon} alt={icon.name} />
            <span>{icon.name}</span>
          </div>
        ))}
      </div>

      {/* Active Window */}
      {activeWindow && (
        <div className="winxp-window absolute left-1/4 top-1/4 w-2/3 h-2/3">
          <div className="winxp-titlebar">
            <div className="winxp-titlebar-text flex items-center gap-2">
              <img
                src={desktopIcons.find(icon => icon.id === activeWindow)?.icon}
                alt=""
                className="w-4 h-4"
              />
              {desktopIcons.find(icon => icon.id === activeWindow)?.name}
            </div>
            <div className="winxp-window-controls">
              <button className="px-2 text-white hover:bg-blue-700">_</button>
              <button className="px-2 text-white hover:bg-blue-700">□</button>
              <button
                className="px-2 text-white hover:bg-red-600"
                onClick={() => setActiveWindow(null)}
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">
              {desktopIcons.find(icon => icon.id === activeWindow)?.name}
            </h2>
            <p>This feature is not available in the demo.</p>
          </div>
        </div>
      )}

      {/* Start Menu */}
      {startMenuOpen && (
        <div className="absolute bottom-12 left-0 w-64 bg-white rounded-t-lg shadow-lg border border-blue-800">
          <div className="bg-blue-800 p-4">
            <div className="flex items-center gap-4">
              <img
                src="https://i.imgur.com/hAHJZMJ.png"
                alt="User"
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <span className="text-white font-bold">User</span>
            </div>
          </div>
          <div className="p-2">
            <div className="hover:bg-blue-100 p-2 rounded flex items-center gap-2">
              <img src="https://i.imgur.com/VA8RCtI.png" alt="" className="w-6 h-6" />
              Internet Explorer
            </div>
            <div className="hover:bg-blue-100 p-2 rounded flex items-center gap-2">
              <img src="https://i.imgur.com/hDYBOxo.png" alt="" className="w-6 h-6" />
              My Computer
            </div>
            <div className="hover:bg-blue-100 p-2 rounded flex items-center gap-2">
              <img src="https://i.imgur.com/4QhUGFJ.png" alt="" className="w-6 h-6" />
              My Documents
            </div>
            <div className="border-t my-2"></div>
            <div className="hover:bg-blue-100 p-2 rounded flex items-center gap-2">
              <img src="https://i.imgur.com/OBqaVji.png" alt="" className="w-6 h-6" />
              Turn Off Computer
            </div>
          </div>
        </div>
      )}

      {/* Taskbar */}
      <div className="winxp-taskbar">
        <button
          className="start-button"
          onClick={toggleStartMenu}
        >
          <img
            src="https://i.imgur.com/jD177JQ.png"
            alt="Start"
            className="w-4 h-4"
          />
          Start
        </button>

        <div className="quick-launch">
          <div className="taskbar-icon">
            <img
              src="https://i.imgur.com/VA8RCtI.png"
              alt="IE"
              className="w-6 h-6"
            />
          </div>
          <div className="taskbar-icon">
            <img
              src="https://i.imgur.com/hDYBOxo.png"
              alt="My Computer"
              className="w-6 h-6"
            />
          </div>
        </div>

        {/* Active Windows in Taskbar */}
        <div className="flex-1 flex items-center px-2">
          {activeWindow && (
            <div
              className="flex items-center gap-2 px-2 py-1 bg-blue-700 text-white rounded cursor-pointer"
              onClick={() => setActiveWindow(null)}
            >
              <img
                src={desktopIcons.find(icon => icon.id === activeWindow)?.icon}
                alt=""
                className="w-4 h-4"
              />
              <span className="text-sm">
                {desktopIcons.find(icon => icon.id === activeWindow)?.name}
              </span>
            </div>
          )}
        </div>

        <div className="system-tray">
          <img
            src="https://i.imgur.com/8TzKBwX.png"
            alt="Volume"
            className="w-4 h-4"
          />
          <DigitalClock />
        </div>
      </div>
    </div>
  );
};

export default WinXPDesktop;