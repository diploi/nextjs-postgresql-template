import { FC, ChangeEvent, useRef, useEffect } from 'react';

export interface Item {
  id: number;
  name: string;
  checked: boolean;
}

export interface ListItemProps extends Item {
  id: number;
  name: string;
  checked: boolean;
  onChange: (item:Item ) => void;
  onDelete: (item:Item)  => void;
}

export const ListItem: FC<ListItemProps> = ({ id, name, checked, onChange, onDelete }) => {
  const item = { id, name, checked };
  const nameRef = useRef<HTMLInputElement>(null);

  // Update name input value when it changes outside of this component
  useEffect(() => {
    if (!nameRef.current) return;
    nameRef.current.value = name;
  }, [name]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updated = { ...item, name: event.target.value };
    onChange(updated);
  };

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const updated = { ...item, checked: event.target.checked };
    onChange(updated);
  };

  const handleDelete = () => onDelete(item);

  return (
    <li key={id}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
      />
      <input
        type="text"
        placeholder="…"
        onBlur={handleNameChange}
        ref={nameRef}
      />
      <button onClick={handleDelete}>×</button>
    </li>
  );
};
