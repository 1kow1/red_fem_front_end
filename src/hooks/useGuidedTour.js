import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * Hook personalizado para gerenciar tours guiados usando Driver.js
 * @param {string} tourId - Identificador único do tour (ex: 'consultas', 'formularios')
 * @param {Array} steps - Array de passos do tour
 * @returns {Object} Funções para controlar o tour
 */
export const useGuidedTour = (tourId, steps) => {
  const TOUR_STORAGE_KEY = `tour_completed_${tourId}`;

  /**
   * Verifica se o usuário já completou este tour
   */
  const hasCompletedTour = () => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  };

  /**
   * Marca o tour como completado
   */
  const markTourAsCompleted = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  /**
   * Reseta o status do tour (útil para testes)
   */
  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  };

  /**
   * Inicia o tour guiado
   */
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Próximo',
      prevBtnText: 'Anterior',
      doneBtnText: 'Concluir',
      closeBtnText: '×',
      progressText: '{{current}} de {{total}}',
      onDestroyed: () => {
        markTourAsCompleted();
      },
      steps: steps.map((step, index) => ({
        element: step.element,
        popover: {
          title: step.title,
          description: step.description,
          side: step.side || 'bottom',
          align: step.align || 'start',
        }
      }))
    });

    driverObj.drive();
  };

  /**
   * Inicia o tour automaticamente se o usuário ainda não o completou
   */
  const startTourIfNotCompleted = () => {
    if (!hasCompletedTour()) {
      // Delay pequeno para garantir que os elementos da página foram renderizados
      setTimeout(() => {
        startTour();
      }, 500);
    }
  };

  return {
    startTour,
    startTourIfNotCompleted,
    hasCompletedTour,
    resetTour,
    markTourAsCompleted
  };
};
