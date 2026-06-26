import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? 'var(--accent-primary)' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
    borderRadius: '8px',
    minHeight: '46px',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--accent-primary)' : '#94a3b8'
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 16px'
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#64748b',
    '&:hover': {
      color: 'var(--accent-primary)'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'var(--accent-primary)' 
      : state.isFocused 
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'transparent',
    color: state.isSelected ? 'white' : 'var(--text-primary)',
    cursor: 'pointer',
    padding: '12px 16px',
    '&:active': {
      backgroundColor: 'var(--accent-primary)',
      color: 'white'
    }
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
    border: '1px solid var(--glass-border)',
    zIndex: 9999,
    marginTop: '4px'
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0
  })
};

export default function CustomSelect({ options, value, onChange, placeholder, isRequired, name, style }) {
  const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

  const handleChange = (selected) => {
    // Mimic the standard event signature for our generic handleInputChange
    onChange({
      target: {
        name: name,
        value: selected ? selected.value : ''
      }
    });
  };

  return (
    <div style={{ flex: 1, ...style }}>
      <Select
        name={name}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        styles={customStyles}
        placeholder={placeholder || "Select..."}
        isSearchable={true}
        required={isRequired}
      />
    </div>
  );
}
