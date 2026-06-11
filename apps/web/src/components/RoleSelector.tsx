import { ChevronDown } from 'lucide-react';
import {
  ROLE_GROUP_LABELS,
  ROLE_GROUPS,
  getRoleMeta,
  rolesByGroup,
  type RoleId,
} from '../lib/roles';

type Props = {
  value: string;
  onChange: (id: RoleId) => void;
  disabled?: boolean;
  className?: string;
  showHint?: boolean;
};

export function RoleSelector({
  value,
  onChange,
  disabled,
  className = 'input',
  showHint = true,
}: Props) {
  const meta = getRoleMeta(value);

  return (
    <div className="role-selector">
      <div className="role-select-wrap">
        <select
          className={className}
          value={value}
          onChange={(e) => onChange(e.target.value as RoleId)}
          disabled={disabled}
        >
          {ROLE_GROUPS.map((group) => (
            <optgroup key={group} label={ROLE_GROUP_LABELS[group]}>
              {rolesByGroup(group).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <ChevronDown size={14} className="role-select-chevron" />
      </div>
      {showHint && meta && (
        <p className="role-hint">{meta.description}</p>
      )}
      <style>{`
        .role-selector { display: flex; flex-direction: column; gap: 0.3rem; }
        .role-select-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .role-select-wrap select {
          appearance: none;
          padding-right: 1.75rem;
          width: 100%;
        }
        .role-select-chevron {
          position: absolute;
          right: 0.6rem;
          pointer-events: none;
          color: var(--text-muted);
        }
        .role-hint {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
          padding-left: 0.1rem;
        }
      `}</style>
    </div>
  );
}

export { getRoleMeta };
