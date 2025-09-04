export default function Input({ type, placeholder, className, ...props }) {
  return (
    <input
      type={type}
      className={`
        border-b border-b-gray-950 placeholder:text-gray-500
        p-1 w-full mb-4 outline-none
        focus:border-b-redfemActionPink focus:border-b-2 focus:bg-redfemOffWhite
        disabled:bg-gray-50
        ${className}`}
      placeholder={placeholder}
      {...props}
    />
  );
}