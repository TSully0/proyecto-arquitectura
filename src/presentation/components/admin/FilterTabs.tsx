interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface FilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  buttonClass?: string;  // por ejemplo "filter-btn" en la pantalla de usuarios
  className?: string;
}

/*
  Fila de botones de filtro. Ejemplo:

    <FilterTabs
      options={[{ value: "all", label: "Todos" }, { value: "user", label: "Usuarios" }]}
      value={filter}
      onChange={setFilter}
    />
*/
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  buttonClass = "admin-filter",
  className = "admin-filters"
}: FilterTabsProps<T>) {
  return (
    <div className={className}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`${buttonClass} ${value === o.value ? "active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
