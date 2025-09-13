import { ButtonPrimary, ButtonSecondary } from "./Button";

export default function ConfirmationPopUp({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg">
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-4">
                    <ButtonSecondary onClick={onCancel}>Cancelar</ButtonSecondary>
                    <ButtonPrimary onClick={onConfirm}>Confirmar</ButtonPrimary>
                </div>
            </div>
        </div>
    );
}