import { useState, useEffect } from 'react';
import { referralsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './NetworkVisualization.css';

const NetworkVisualization = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      const response = await referralsAPI.getTree();
      setTreeData(response.data.tree);
    } catch (error) {
      console.error('Error fetching tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTreeNode = (node, level = 0) => {
    if (!node) return null;

    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node._id || 'root'} className={`tree-node level-${level}`}>
        <div 
          className="node-card glass"
          onClick={() => setSelectedUser(node)}
        >
          <div className="node-header">
            <div className="node-avatar">
              {node.name ? node.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div className="node-info">
              <h4>{node.name || 'Root'}</h4>
              <p>{node.email || 'System'}</p>
            </div>
          </div>
          <div className="node-stats">
            <div className="node-stat">
              <span>Code:</span>
              <span className="code">{node.referralCode || 'N/A'}</span>
            </div>
            <div className="node-stat">
              <span>Books:</span>
              <span>{node.purchasedBooks?.length || 0}</span>
            </div>
            <div className="node-stat">
              <span>Children:</span>
              <span>{hasChildren ? node.children.length : 0}</span>
            </div>
          </div>
          {node.createdAt && (
            <div className="node-date">
              Joined: {new Date(node.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {hasChildren && (
          <div className="node-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="network-visualization-container">
      <div className="page-header">
        <h1 className="page-title">Referral Network Tree</h1>
        <p className="page-subtitle">View the entire referral network structure</p>
      </div>

      <div className="network-stats glass">
        <div className="stat-item">
          <span className="stat-label">Total Users in Tree</span>
          <span className="stat-value">{countTotalUsers(treeData)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Max Depth</span>
          <span className="stat-value">{calculateMaxDepth(treeData)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Root Users</span>
          <span className="stat-value">{treeData?.length || 0}</span>
        </div>
      </div>

      <div className="tree-container glass">
        {treeData && treeData.length > 0 ? (
          <div className="tree-root">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No referral network data available</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">User Details</h2>
            
            <div className="user-detail">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedUser.name || 'Root'}</span>
            </div>
            <div className="user-detail">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{selectedUser.email || 'N/A'}</span>
            </div>
            <div className="user-detail">
              <span className="detail-label">Referral Code:</span>
              <span className="detail-value code">{selectedUser.referralCode || 'N/A'}</span>
            </div>
            <div className="user-detail">
              <span className="detail-label">Purchased Books:</span>
              <span className="detail-value">{selectedUser.purchasedBooks?.length || 0}</span>
            </div>
            <div className="user-detail">
              <span className="detail-label">Direct Children:</span>
              <span className="detail-value">{selectedUser.children?.length || 0}</span>
            </div>
            {selectedUser.createdAt && (
              <div className="user-detail">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </span>
              </div>
            )}

            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-primary modal-close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const countTotalUsers = (tree) => {
  if (!tree || tree.length === 0) return 0;
  
  let count = 0;
  
  const traverse = (node) => {
    if (!node) return;
    count++;
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  };
  
  tree.forEach(traverse);
  return count;
};

const calculateMaxDepth = (tree) => {
  if (!tree || tree.length === 0) return 0;
  
  let maxDepth = 0;
  
  const traverse = (node, depth) => {
    if (!node) return;
    maxDepth = Math.max(maxDepth, depth);
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  };
  
  tree.forEach(node => traverse(node, 1));
  return maxDepth;
};

export default NetworkVisualization;
