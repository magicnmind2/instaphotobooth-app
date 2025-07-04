import React, { useState, useCallback, useEffect } from 'react';
import { AppState, PurchaseOption, ActiveSession, DesignLayout } from './types';
import { MASTER_ADMIN_CODE } from './constants';
import { ActivationScreen } from './components/ActivationScreen';
import { PreviewScreen } from './components/PreviewScreen';
import { PhotoScreen } from './components/PhotoScreen';
import { LandingScreen } from './components/LandingScreen';
import { PurchaseSuccessScreen } from './components/PurchaseSuccessScreen';
import { SessionExpiredScreen } from './components/SessionExpiredScreen';
import { DesignStudio } from './components/DesignStudio';
import { SalesPage } from './components/SalesPage';
import axios from 'axios';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SALES_PAGE);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [activationError, setActivationError] = useState('');
  const [purchaseError, setPurchaseError] = useState('');
  const [selectedPurchaseOption, setSelectedPurchaseOption] = useState<PurchaseOption | null>(null);

  const handlePurchaseSelect = useCallback(async (option: PurchaseOption) => {
    try {
      const apiUrl = `${window.location.origin}/api/checkout`;
      const { data } = await axios.post(apiUrl, { priceId: option.id });
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Could not start the checkout process. Please try again.');
    }
  }, []);
  
  const verifyPurchase = useCallback(async (stripeSessionId: string) => {
    setAppState(AppState.PURCHASE_SUCCESS);
    try {
      const apiUrl = `${window.location.origin}/api/verify-purchase`;
      const { data: session } = await axios.post<ActiveSession>(apiUrl, { stripeSessionId });
      setActiveSession(session);
      if (session.hasDesignStudio) {
        setAppState(AppState.DESIGN_STUDIO);
      } else {
        setAppState(AppState.PREVIEW);
      }
      window.history.replaceState({}, document.title, "/");
    } catch (error) {
        console.error('Purchase verification failed:', error);
        setPurchaseError('Could not verify your purchase. Please try your access code from your email, or contact support.');
    }
  }, []);

  const handleActivate = useCallback(async (code: string) => {
    setActivationError('');
    if (code === MASTER_ADMIN_CODE) {
      const adminSession: ActiveSession = {
        code: MASTER_ADMIN_CODE,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minute preview
        emailLimit: 5,
        emailsSent: 0,
        hasDesignStudio: true,
        designLayout: null,
      };
      setActiveSession(adminSession);
      setAppState(AppState.DESIGN_STUDIO);
      return true;
    }

    try {
      const apiUrl = `${window.location.origin}/api/activate`;
      const { data: session } = await axios.post<ActiveSession>(apiUrl, { code });
      setActiveSession(session);
      if (session.hasDesignStudio) {
        setAppState(AppState.DESIGN_STUDIO);
      } else {
        setAppState(AppState.PREVIEW);
      }
      return true;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid or expired code.';
      setActivationError(message);
      return false;
    }
  }, []);
  
  const handleDesignSave = useCallback(async (layout: DesignLayout) => {
    if (!activeSession) return;
    
    const updatedSession = { ...activeSession, designLayout: layout };
    setActiveSession(updatedSession);

    if (activeSession.code !== MASTER_ADMIN_CODE) {
      try {
        await axios.post('/api/save-design', { code: activeSession.code, designLayout: layout });
      } catch (error) {
        console.error("Failed to save design:", error);
        // Optionally notify user, but proceed for now
      }
    }
    setAppState(AppState.PREVIEW);
  }, [activeSession]);

  const handlePhotosTaken = useCallback((imageDataUrls: string[]) => {
    setCapturedImages(imageDataUrls);
    setAppState(AppState.PHOTO_DISPLAY);
  }, []);

  const handleRetake = useCallback(() => {
    if (activeSession && activeSession.expiresAt < Date.now()) {
      setAppState(AppState.SESSION_EXPIRED);
      return;
    }
    setCapturedImages([]);
    setAppState(AppState.PREVIEW);
  }, [activeSession]);

  const handleSessionExpired = useCallback(() => {
    setActiveSession(null);
    setAppState(AppState.SESSION_EXPIRED);
  }, []);

  const handleExit = useCallback(() => {
    setAppState(AppState.SALES_PAGE);
    setActiveSession(null);
    setCapturedImages([]);
  }, []);
  
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const stripeSessionId = query.get('session_id');
    if (stripeSessionId) {
      verifyPurchase(stripeSessionId);
    }
  }, [verifyPurchase]);

  const renderContent = () => {
    if (activeSession && activeSession.expiresAt < Date.now() && appState !== AppState.SESSION_EXPIRED) {
      handleSessionExpired();
    }

    switch (appState) {
      case AppState.SALES_PAGE:
        return <SalesPage onGetStarted={() => setAppState(AppState.LANDING)} onActivate={() => setAppState(AppState.ACTIVATION)} />;
      case AppState.LANDING:
        return <LandingScreen onPurchaseSelect={handlePurchaseSelect} onActivate={() => setAppState(AppState.ACTIVATION)} onBack={() => setAppState(AppState.SALES_PAGE)} />;
      case AppState.PURCHASE_SUCCESS:
        return <PurchaseSuccessScreen error={purchaseError} onActivate={() => setAppState(AppState.ACTIVATION)} />;
      case AppState.ACTIVATION:
        return <ActivationScreen onActivate={handleActivate} onBack={() => setAppState(AppState.LANDING)} error={activationError} />;
      case AppState.DESIGN_STUDIO:
        return <DesignStudio onSave={handleDesignSave} existingLayout={activeSession?.designLayout} onExit={handleExit} />;
      case AppState.PREVIEW:
        return <PreviewScreen onPhotosTaken={handlePhotosTaken} session={activeSession!} onSessionExpired={handleSessionExpired} onEditDesign={() => setAppState(AppState.DESIGN_STUDIO)} />;
      case AppState.PHOTO_DISPLAY:
        return <PhotoScreen imageDataUrls={capturedImages} onRetake={handleRetake} session={activeSession!} onSessionExpired={handleSessionExpired} />;
      case AppState.SESSION_EXPIRED:
        return <SessionExpiredScreen onPurchaseMore={() => setAppState(AppState.LANDING)} onExit={handleExit} />;
      default:
        return <SalesPage onGetStarted={() => setAppState(AppState.LANDING)} onActivate={() => setAppState(AppState.ACTIVATION)} />;
    }
  };

  return (
    <div className="h-screen w-screen font-sans antialiased bg-gray-900 text-white overflow-x-hidden">
      {renderContent()}
    </div>
  );
};

export default App;