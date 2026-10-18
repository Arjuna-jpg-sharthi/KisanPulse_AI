import React, { Suspense, useMemo } from 'react';
import { Sprout, FileCheck2 } from 'lucide-react';
import { ModulePlaceholder } from './ModulePlaceholder';
import { Loading } from '../shared/Loading';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useLanguage } from '../../i18n/LanguageContext';
import { useNetwork } from '../../context/NetworkContext';

/**
 * INTEGRATION CONTRACT:
 * The application must import:
 * - src/modules/farming/FarmingModule.jsx
 * - src/modules/schemes/SchemeModule.jsx
 * Each module exports one default React component.
 *
 * Vite's import.meta.glob dynamically scans for these modules.
 * If present, they are lazy-loaded and safely rendered with ErrorBoundary + Suspense.
 * If missing, ModulePlaceholder is shown without crashing the app shell.
 */
const dynamicModuleRegistry = import.meta.glob([
  '../../modules/farming/FarmingModule.jsx',
  '../../modules/schemes/SchemeModule.jsx',
  '/src/modules/farming/FarmingModule.jsx',
  '/src/modules/schemes/SchemeModule.jsx'
]);

export const ModuleContainer = ({ moduleId, onNavigate, adminOnly = false }) => {
  const { language, t } = useLanguage();
  const { isOffline } = useNetwork();

  const isFarming = moduleId === 'farming';

  // Check if target module exists in dynamic registry
  const moduleLoader = useMemo(() => {
    if (isFarming) {
      return (
        dynamicModuleRegistry['../../modules/farming/FarmingModule.jsx'] ||
        dynamicModuleRegistry['/src/modules/farming/FarmingModule.jsx'] ||
        null
      );
    } else {
      return (
        dynamicModuleRegistry['../../modules/schemes/SchemeModule.jsx'] ||
        dynamicModuleRegistry['/src/modules/schemes/SchemeModule.jsx'] ||
        null
      );
    }
  }, [isFarming]);

  // Create lazy component if loader is present
  const LazyComponent = useMemo(() => {
    if (!moduleLoader) return null;
    return React.lazy(moduleLoader);
  }, [moduleLoader]);

  const moduleProps = {
    language,
    isOffline,
    t,
    navigate: onNavigate,
    adminOnly
  };

  const title = isFarming
    ? t('navCropHealth', 'Crop Health & Smart Farming')
    : t('navSchemes', 'Government SchemeMatch AI');

  const expectedPath = isFarming
    ? 'src/modules/farming/FarmingModule.jsx'
    : 'src/modules/schemes/SchemeModule.jsx';

  const icon = isFarming ? Sprout : FileCheck2;

  return (
    <div className="kp-module-wrapper">
      <ErrorBoundary
        title={`${title} Error`}
        message="An unexpected runtime issue occurred inside this external module. The application shell protected your session."
        onReset={() => onNavigate('dashboard')}
      >
        {LazyComponent ? (
          <Suspense fallback={<Loading size="lg" text={`Loading ${title}...`} />}>
            <LazyComponent {...moduleProps} />
          </Suspense>
        ) : (
          <ModulePlaceholder
            moduleId={moduleId}
            title={title}
            expectedPath={expectedPath}
            icon={icon}
            onBackToDashboard={() => onNavigate('dashboard')}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default ModuleContainer;
