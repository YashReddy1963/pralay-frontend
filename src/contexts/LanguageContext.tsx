import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
}

// Citizen Language Context
const CitizenLanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const CitizenLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("citizen-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("citizen-language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const t = (key: string, options?: any): string => {
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : key;
  };

  return (
    <CitizenLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </CitizenLanguageContext.Provider>
  );
};

export const useCitizenLanguage = () => {
  const context = useContext(CitizenLanguageContext);
  if (!context) {
    throw new Error("useCitizenLanguage must be used within CitizenLanguageProvider");
  }
  return context;
};

// Official Language Context
const OfficialLanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const OfficialLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("official-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("official-language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const t = (key: string, options?: any): string => {
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : key;
  };

  return (
    <OfficialLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </OfficialLanguageContext.Provider>
  );
};

export const useOfficialLanguage = () => {
  const context = useContext(OfficialLanguageContext);
  if (!context) {
    throw new Error("useOfficialLanguage must be used within OfficialLanguageProvider");
  }
  return context;
};

// Admin Language Context
const AdminLanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const AdminLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("admin-language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("admin-language", language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const t = (key: string, options?: any): string => {
    const result = i18n.t(key, options);
    return typeof result === 'string' ? result : key;
  };

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = () => {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    throw new Error("useAdminLanguage must be used within AdminLanguageProvider");
  }
  return context;
};