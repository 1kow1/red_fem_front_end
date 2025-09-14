import { toast } from 'react-toastify';
import { handleApiError } from '../utils/errorHandler';

export const useErrorHandler = () => {
  const showError = (error) => {
    const errorInfo = handleApiError(error);

    if (errorInfo.type === 'validation') {
      // Mostra erros de validação nos campos
      Object.values(errorInfo.errors).forEach(msg => {
        toast.error(msg);
      });
      return errorInfo.errors;
    } else {
      // Mostra erro geral
      toast.error(errorInfo.message);
      return null;
    }
  };

  const showSuccess = (message) => {
    toast.success(message);
  };

  const handleAsyncError = async (asyncFunction, successMessage = null) => {
    try {
      const result = await asyncFunction();
      if (successMessage) {
        showSuccess(successMessage);
      }
      return { success: true, data: result };
    } catch (error) {
      const validationErrors = showError(error);
      return { success: false, errors: validationErrors };
    }
  };

  return { showError, showSuccess, handleAsyncError };
};