

export default function EditPopUp({
  isOpen,
  onClose,
  title,
  fields
}) {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-2xl font-light">&times;</button>
        </div>
    </div>
  )
}