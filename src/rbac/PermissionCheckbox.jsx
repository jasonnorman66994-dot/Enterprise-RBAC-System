import React from 'react';

export function PermissionCheckbox({ permission, checked, onChange, disabled = false }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{
          marginRight: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      />
      <span style={{ fontSize: '14px', color: '#374151' }}>
        {permission}
      </span>
    </label>
  );
}

export default PermissionCheckbox;
