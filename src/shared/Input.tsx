type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export default function Input(props: InputProps) {
  return (
    <div className="p-2">
      <label htmlFor={props.name} className="block">
        {props.label}
      </label>
      <input
        id={props.name}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="border p-2 rounded"
        type="text"
      />
    </div>
  );
}
