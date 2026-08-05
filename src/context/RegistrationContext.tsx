// src/context/registrationContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { RegistrationData, Step } from '../types/registration';
import registrationApi from '../api/registrationApi';

interface RegistrationContextType {
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  formData: RegistrationData;
  updateFormData: (data: Partial<RegistrationData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToComplete: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  isComplete: boolean;
  submitRegistration: () => Promise<{ success: boolean; message?: string; error?: string; errors?: any }>;
  isSubmitting: boolean;
}

const initialData: RegistrationData = {
  firstName: '',
  middleName: '',
  lastName: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  dateOfBirth: '',
  country: 'Tanzania',
  region: '',
  city: '',
  profilePicture: null,
  ninNumber: '',
  nationalId: '',
  birthCertificate: '',
  topEducationLevel: '',
  interests: [],
  howDidYouHear: '',
  agreeToTerms: false,
  likePlatform: false,
  receiveUpdates: false,
  password: '',
  confirmPassword: '',
};

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};

interface RegistrationProviderProps {
  children: ReactNode;
}

export const RegistrationProvider: React.FC<RegistrationProviderProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<RegistrationData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (data: Partial<RegistrationData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const goToComplete = () => {
    setCurrentStep(7 as Step);
  };

  const submitRegistration = async () => {
    console.log('Submitting registration data:', formData);
    setIsSubmitting(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = formData;
      
      const result = await registrationApi.register(submitData);
      console.log('API Response:', result);
      
      if (result.success) {
        goToComplete();
        return { 
          success: true, 
          message: result.message || 'Registration successful!' 
        };
      } else {
        let errorMessage = result.error || 'Registration failed';
        
        // Handle different error formats
        if (result.errors) {
          if (Array.isArray(result.errors)) {
            // Array of error objects - each might have 'msg' or 'message'
            const errorStrings = result.errors.map((err: any) => {
              return err.msg || err.message || err.error || String(err);
            });
            errorMessage = errorStrings.join(', ');
          } else if (typeof result.errors === 'object') {
            // Object with field names as keys
            const errorStrings = Object.values(result.errors).flat();
            errorMessage = errorStrings.join(', ');
          }
        }
        
        return { 
          success: false, 
          error: errorMessage,
          errors: result.errors
        };
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === 6;
  const isFirstStep = currentStep === 1;
  const isComplete = currentStep === 7;

  return (
    <RegistrationContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        nextStep,
        prevStep,
        goToComplete,
        isLastStep,
        isFirstStep,
        isComplete,
        submitRegistration,
        isSubmitting,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};