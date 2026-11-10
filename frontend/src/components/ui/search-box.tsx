import { Icon } from "../icons";

/** Text input with a magnifier icon, used to filter the tables. */
export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-brand-200 bg-white px-3 py-2 focus-within:border-brand-500">
      <Icon name="search" className="h-4 w-4 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={100} // the API refuses longer searches
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
      />
    </div>
  );
}
