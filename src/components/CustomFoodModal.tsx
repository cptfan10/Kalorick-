import React from 'react';
import type { FoodItem } from '../types/nutrition.ts';
import { FoodEditorModal } from './FoodEditorModal.tsx';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFood: (food: FoodItem) => void;
  onDeleteFood?: (foodId: string) => void;
  foodToEdit?: FoodItem | null;
  initialBarcode?: string;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = (props) => {
  return <FoodEditorModal {...props} />;
};
