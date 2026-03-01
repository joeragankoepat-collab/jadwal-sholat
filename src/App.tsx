/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Display from './components/Display';
import Admin from './components/Admin';
import { useSettings } from './hooks/useSettings';

export default function App() {
  const { settings, updateSettings } = useSettings();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="antialiased selection:bg-emerald-500/30">
      <Display 
        settings={settings} 
        onOpenAdmin={() => setIsAdminOpen(true)} 
      />
      
      {isAdminOpen && (
        <Admin 
          settings={settings} 
          onSave={updateSettings} 
          onClose={() => setIsAdminOpen(false)} 
        />
      )}
    </div>
  );
}
