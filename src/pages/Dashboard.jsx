import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('local');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  const [cloudConfig, setCloudConfig] = useState({
    provider: 'aws',
    region: '',
    instanceType: ''
  });

  const availableAddons = [
    { id: 'grafana', name: 'Grafana', description: 'Analytics & monitoring platform' },
    { id: 'prometheus', name: 'Prometheus', description: 'Monitoring system & time series database' },
    { id: 'jaeger', name: 'Jaeger', description: 'Distributed tracing system' },
    { id: 'elasticsearch', name: 'Elasticsearch', description: 'Search and analytics engine' },
    { id: 'kibana', name: 'Kibana', description: 'Data visualization dashboard' },
    { id: 'postgres', name: 'PostgreSQL', description: 'Relational database' },
    { id: 'redis', name: 'Redis', description: 'In-memory data store' },
    { id: 'vault', name: 'HashiCorp Vault', description: 'Secrets management' }
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
    
    // Simulate deployment process
    setTimeout(() => {
      setDeploymentStatus('success');
      setTimeout(() => setDeploymentStatus(null), 5000);
    }, 3000);
  };

  const handleCloudDeploy = () => {
    if (!cloudConfig.region || !cloudConfig.instanceType) {
      alert('Please fill in all cloud configuration fields');
      return;
    }
    
    setDeploymentStatus('deploying');
    
    // Simulate cloud deployment
    setTimeout(() => {
      setDeploymentStatus('success');
      setTimeout(() => setDeploymentStatus(null), 5000);
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Kong Deploy UI</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            Local Deployment
          </button>
          <button 
            className={`tab ${activeTab === 'cloud' ? 'active' : ''}`}
            onClick={() => setActiveTab('cloud')}
          >
            Cloud Deployment
          </button>
        </div>

        <div className="main-panel">
          <section className="addons-section">
            <h2>Select Third-Party Software</h2>
            <p className="section-description">Choose the software components to include in your Kong environment</p>
            
            <div className="addons-grid">
              {availableAddons.map(addon => (
                <div 
                  key={addon.id}
                  className={`addon-card ${selectedAddons.includes(addon.id) ? 'selected' : ''}`}
                  onClick={() => handleAddonToggle(addon.id)}
                >
                  <div className="addon-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedAddons.includes(addon.id)}
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="addon-info">
                    <h3>{addon.name}</h3>
                    <p>{addon.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {activeTab === 'local' && (
            <section className="deployment-section">
              <h2>Local Environment Configuration</h2>
              <div className="config-info">
                <p><strong>Selected Components:</strong> {selectedAddons.length === 0 ? 'None' : selectedAddons.join(', ')}</p>
                <p><strong>Deployment Type:</strong> Local Docker Containers</p>
              </div>
              <button 
                onClick={handleLocalDeploy}
                className="deploy-button"
                disabled={selectedAddons.length === 0 || deploymentStatus === 'deploying'}
              >
                {deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy Locally'}
              </button>
            </section>
          )}

          {activeTab === 'cloud' && (
            <section className="deployment-section">
              <h2>Cloud Environment Configuration</h2>
              
              <div className="cloud-config-form">
                <div className="form-group">
                  <label htmlFor="provider">Cloud Provider</label>
                  <select 
                    id="provider"
                    value={cloudConfig.provider}
                    onChange={(e) => setCloudConfig({...cloudConfig, provider: e.target.value})}
                  >
                    <option value="aws">Amazon Web Services (AWS)</option>
                    <option value="gcp">Google Cloud Platform (GCP)</option>
                    <option value="azure">Microsoft Azure</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="region">Region</label>
                  <input 
                    type="text"
                    id="region"
                    placeholder="e.g., us-east-1"
                    value={cloudConfig.region}
                    onChange={(e) => setCloudConfig({...cloudConfig, region: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="instanceType">Instance Type</label>
                  <input 
                    type="text"
                    id="instanceType"
                    placeholder="e.g., t3.medium"
                    value={cloudConfig.instanceType}
                    onChange={(e) => setCloudConfig({...cloudConfig, instanceType: e.target.value})}
                  />
                </div>
              </div>

              <div className="config-info">
                <p><strong>Selected Components:</strong> {selectedAddons.length === 0 ? 'None' : selectedAddons.join(', ')}</p>
                <p><strong>Provider:</strong> {cloudConfig.provider.toUpperCase()}</p>
                {cloudConfig.region && <p><strong>Region:</strong> {cloudConfig.region}</p>}
              </div>

              <button 
                onClick={handleCloudDeploy}
                className="deploy-button"
                disabled={selectedAddons.length === 0 || deploymentStatus === 'deploying'}
              >
                {deploymentStatus === 'deploying' ? 'Deploying to Cloud...' : 'Deploy to Cloud'}
              </button>
            </section>
          )}

          {deploymentStatus === 'success' && (
            <div className="success-message">
              ✓ Deployment completed successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
