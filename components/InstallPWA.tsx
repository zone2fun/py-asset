import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
        setSupportsPWA(false);
        return;
    }

    // Android / Desktop Chrome handler
    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, we always show the button if not in standalone mode
    if (isIosDevice && !isStandalone) {
        setSupportsPWA(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isIOS) {
        setShowIOSInstructions(true);
    } else if (promptInstall) {
        promptInstall.prompt();
    }
  };

  if (!supportsPWA) return null;

  return (
    <>
        <button 
            onClick={handleInstallClick}
            className="w-full mt-3 bg-emerald-800/30 hover:bg-emerald-800/50 text-white py-2 px-4 rounded-xl shadow-sm flex items-center justify-center font-medium text-sm backdrop-blur-sm transition-all border border-white/20"
        >
            <Download size={18} className="mr-2" />
            ลงแอปไว้บนมือถือ
        </button>

        {/* iOS Instructions Modal */}
        {showIOSInstructions && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl relative">
                    <button 
                        onClick={() => setShowIOSInstructions(false)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-2"
                    >
                        <X size={20} />
                    </button>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">วิธีติดตั้งบน iOS</h3>
                    
                    <div className="space-y-4 text-slate-600 text-sm">
                        <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-3 font-bold text-xs shrink-0">1</span>
                            <span>กดปุ่ม <Share size={16} className="inline mx-1 text-blue-500" /> (แชร์) ด้านล่าง</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-3 font-bold text-xs shrink-0">2</span>
                            <span>เลือกเมนู <span className="font-bold text-slate-800">"เพิ่มไปยังหน้าจอโฮม"</span> <br/>(Add to Home Screen)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-3 font-bold text-xs shrink-0">3</span>
                            <span>กดปุ่ม <span className="font-bold text-blue-600">"เพิ่ม"</span> (Add) มุมขวาบน</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                             onClick={() => setShowIOSInstructions(false)}
                             className="text-emerald-600 font-bold text-sm"
                        >
                            เข้าใจแล้ว
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default InstallPWA;