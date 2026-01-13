// Settings page for configuration

import { ConfigPanel } from '@/components/dashboard/ConfigPanel';

export default function Settings() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">
          Configure your brand name and API keys for AI platform integration
        </p>
      </div>

      <ConfigPanel />
    </div>
  );
}
