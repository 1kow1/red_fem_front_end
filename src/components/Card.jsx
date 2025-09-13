export default function Card({ children, className }) {
  return (
    <div className={`border bg-white border-gray-300 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  )
}