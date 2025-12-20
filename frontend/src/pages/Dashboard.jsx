import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('local');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cloudConfig, setCloudConfig] = useState({
    provider: 'aws',
    region: '',
    instanceType: ''
  });

  const availableAddons = [
    { id: 'grafana', name: 'Grafana', description: 'Analytics & monitoring platform', category: 'Observability' },
    { id: 'prometheus', name: 'Prometheus', description: 'Monitoring system & time series database', category: 'Observability' },
    { id: 'jaeger', name: 'Jaeger', description: 'Distributed tracing system', category: 'Tracing' },
    { id: 'elasticsearch', name: 'Elasticsearch', description: 'Search and analytics engine', category: 'Logging' },
    { id: 'kibana', name: 'Kibana', description: 'Data visualization dashboard', category: 'Logging' },
    { id: 'postgres', name: 'PostgreSQL', description: 'Relational database', category: 'Storage' },
    { id: 'redis', name: 'Redis', description: 'In-memory data store', category: 'Storage' },
    { id: 'vault', name: 'HashiCorp Vault', description: 'Secrets management', category: 'Security' }
  ];

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleLocalDeploy = () => {
    setDeploymentStatus('deploying');
    setTimeout(() => {
      setDeploymentStatus('success');
      setTimeout(() => setDeploymentStatus(null), 5000);
    }, 3000);
  };

  const handleCloudDeploy = () => {
    if (!cloudConfig.region || !cloudConfig.instanceType) {
      setErrorMessage('Please fill in all cloud configuration fields');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    setErrorMessage('');
    setDeploymentStatus('deploying');
    setTimeout(() => {
      setDeploymentStatus('success');
      setTimeout(() => setDeploymentStatus(null), 5000);
    }, 3000);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-viewport">
        <Header title="Environment Orchestration" />

        <main className="dashboard-content">
          <div className="content-container">
            {/* Stats Overview */}
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-label">Active Deployments</span>
                <span className="stat-value">12</span>
                <span className="stat-change positive">+2 this week</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Services</span>
                <span className="stat-value">48</span>
                <span className="stat-change">No change</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">System Health</span>
                <span className="stat-value">99.9%</span>
                <span className="stat-change positive">Healthy</span>
              </div>
            </div>

            <div className="content-grid">
              <div className="primary-column">
                <section className="dashboard-section addons-section">
                  <div className="section-header">
                    <div>
                      <h2>Service Add-ons</h2>
                      <p className="section-subtitle">Select Enterprise modules and third-party software to deploy</p>
                    </div>
                  </div>

                  <div className="addons-grid">
                    {availableAddons.map(addon => (
                      <div
                        key={addon.id}
                        className={`addon-card ${selectedAddons.includes(addon.id) ? 'selected' : ''}`}
                        onClick={() => handleAddonToggle(addon.id)}
                      >
                        <div className="addon-header">
                          <span className="addon-category">{addon.category}</span>
                          <div className={`checkbox-custom ${selectedAddons.includes(addon.id) ? 'checked' : ''}`}>
                            {selectedAddons.includes(addon.id) && '✓'}
                          </div>
                        </div>
                        <div className="addon-info">
                          <h3>{addon.name}</h3>
                          <p>{addon.description}</p>
                        </div>
                        <div className="addon-footer">
                          <span className="addon-status">Available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="secondary-column">
                <section className="dashboard-section deployment-card">
                  <div className="tabs-minimal">
                    <button
                      className={`tab-btn ${activeTab === 'local' ? 'active' : ''}`}
                      onClick={() => setActiveTab('local')}
                    >
                      Local
                    </button>
                    <button
                      className={`tab-btn ${activeTab === 'cloud' ? 'active' : ''}`}
                      onClick={() => setActiveTab('cloud')}
                    >
                      Cloud
                    </button>
                  </div>

                  <div className="deployment-config">
                    {activeTab === 'local' ? (
                      <div className="config-group">
                        <h3>Local Environment</h3>
                        <p>Deploy Kong and selected services to your local Docker infrastructure.</p>
                        <ul className="config-list">
                          <li>Container Runtime: Docker</li>
                          <li>Host: localhost</li>
                          <li>Network: kong-net</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="cloud-form">
                        <h3>Cloud Infrastructure</h3>
                        <div className="form-item">
                          <label>Provider</label>
                          <select
                            value={cloudConfig.provider}
                            onChange={(e) => setCloudConfig({ ...cloudConfig, provider: e.target.value })}
                          >
                            <option value="aws">AWS (Amazon Web Services)</option>
                            <option value="gcp">GCP (Google Cloud Platform)</option>
                            <option value="azure">Azure (Microsoft)</option>
                          </select>
                        </div>
                        <div className="form-item">
                          <label>Region</label>
                          <input
                            type="text"
                            placeholder="us-east-1"
                            value={cloudConfig.region}
                            onChange={(e) => setCloudConfig({ ...cloudConfig, region: e.target.value })}
                          />
                        </div>
                        <div className="form-item">
                          <label>Instance Type</label>
                          <input
                            type="text"
                            placeholder="t3.medium"
                            value={cloudConfig.instanceType}
                            onChange={(e) => setCloudConfig({ ...cloudConfig, instanceType: e.target.value })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="deployment-summary">
                      <div className="summary-row">
                        <span>Selected Add-ons</span>
                        <span>{selectedAddons.length}</span>
                      </div>
                      <div className="summary-row">
                        <span>Total Dependencies</span>
                        <span>{selectedAddons.length + 2}</span>
                      </div>
                    </div>

                    {errorMessage && <div className="feedback error">{errorMessage}</div>}
                    {deploymentStatus === 'success' && <div className="feedback success">Deployment successful!</div>}

                    <button
                      className={`btn-primary full-width ${deploymentStatus === 'deploying' ? 'loading' : ''}`}
                      onClick={activeTab === 'local' ? handleLocalDeploy : handleCloudDeploy}
                      disabled={deploymentStatus === 'deploying' || selectedAddons.length === 0}
                    >
                      {deploymentStatus === 'deploying' ? 'Orchestrating...' : `Deploy to ${activeTab === 'local' ? 'Local' : 'Cloud'}`}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
