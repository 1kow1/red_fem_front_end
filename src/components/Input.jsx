export default function Input({ type, placeholder, className, ...props }) {
  return (
    <input
      type={type}
      className={`border-b border-b-gray-950 placeholder:text-gray-500 p-1 w-full mb-4 outline-none ${className}`}
      placeholder={placeholder}
      {...props}
    />
  );
}