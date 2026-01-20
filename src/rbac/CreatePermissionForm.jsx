import React, { useState } from 'react';
import { useCreatePermission } from './hooks';

const RESOURCE_TYPES = [
  'users',
  'roles',
  'permissions',
  'rbac',
  'audit',
  'system',
];

const ACTION_TYPES = [
  'read',
  'create',
  'update',
  'delete',
  'manage',
  'view',
];

export function CreatePermissionForm({ onClose, onSuccess }) {
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [errors, setErrors] = useState({});
  const createPermissionMutation = useCreatePermission();

  const permissionPreview = resource && action ? `${resource}:${action}` : '';

  const validate = () => {
    const newErrors = {};
    
    if (!resource) {
      newErrors.resource = 'Resource is required';
    }
    
    if (!action) {
      newErrors.action = 'Action is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      const newPermission = await createPermissionMutation.mutateAsync({
        name: `${resource}:${action}`,
        resource,
        action,
      });
      
      onSuccess?.(newPermission);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create permission';
      setErrors({
        submit: errorMessage
      });
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Create New Permission</h3>
          <button
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Resource <span style={styles.required}>*</span>
            </label>
            <select
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              style={{
                ...styles.select,
                ...(errors.resource ? styles.inputError : {}),
              }}
              autoFocus
            >
              <option value="">Select a resource...</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.resource && (
              <div style={styles.errorMessage}>{errors.resource}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Action <span style={styles.required}>*</span>
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              style={{
                ...styles.select,
                ...(errors.action ? styles.inputError : {}),
              }}
            >
              <option value="">Select an action...</option>
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.action && (
              <div style={styles.errorMessage}>{errors.action}</div>
            )}
          </div>

          {permissionPreview && (
            <div style={styles.preview}>
              <label style={styles.previewLabel}>Permission Preview:</label>
              <div style={styles.previewValue}>{permissionPreview}</div>
            </div>
          )}

          {errors.submit && (
            <div style={styles.submitError}>{errors.submit}</div>
          )}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPermissionMutation.isPending}
              style={{
                ...styles.submitButton,
                opacity: createPermissionMutation.isPending ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!createPermissionMutation.isPending) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!createPermissionMutation.isPending) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {createPermissionMutation.isPending ? 'Creating...' : 'Create Permission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  required: {
    color: '#ef4444',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorMessage: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#ef4444',
  },
  preview: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  previewLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '4px',
    display: 'block',
  },
  previewValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
  },
  submitError: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    borderRadius: '6px',
    color: '#ef4444',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default CreatePermissionForm;
