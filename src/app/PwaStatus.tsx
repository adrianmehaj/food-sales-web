import { useEffect, useRef, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { Modal } from '../shared/ui';

interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
export function PwaStatus() {
  const banner = useRef<HTMLDivElement>(null);
  const [online, setOnline] = useState(navigator.onLine); const [install, setInstall] = useState<InstallEvent>(); const [instructions, setInstructions] = useState(false); const [hidden, setHidden] = useState(false); const [waiting, setWaiting] = useState<ServiceWorker>();
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || !!(navigator as Navigator & { standalone?: boolean }).standalone;
  useEffect(() => {
    const root = document.documentElement;
    const element = banner.current;
    if (!element) { root.style.setProperty('--pwa-prompt-height', '0px'); return; }
    const measure = () => root.style.setProperty('--pwa-prompt-height', `${element.getBoundingClientRect().height + 24}px`);
    measure();
    const observer = new ResizeObserver(measure); observer.observe(element);
    return () => { observer.disconnect(); root.style.setProperty('--pwa-prompt-height', '0px'); };
  }, [hidden, standalone, install, ios]);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => document.documentElement.classList.toggle('keyboard-open', window.innerHeight - viewport.height > 160 && /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? ''));
    viewport.addEventListener('resize', update);
    window.addEventListener('focusout', update);
    return () => { viewport.removeEventListener('resize', update); window.removeEventListener('focusout', update); document.documentElement.classList.remove('keyboard-open'); };
  }, []);
  useEffect(() => {
    const offline = () => setOnline(false); const online = () => setOnline(true);
    const prompt = (event: Event) => { event.preventDefault(); setInstall(event as InstallEvent); };
    const installed = () => { setInstall(undefined); setHidden(true); };
    window.addEventListener('online', online); window.addEventListener('offline', offline); window.addEventListener('beforeinstallprompt', prompt); window.addEventListener('appinstalled', installed);
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        if (registration.waiting) setWaiting(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker); });
        });
      }).catch(() => { /* Installation remains available as a normal website. */ });
    }
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); window.removeEventListener('beforeinstallprompt', prompt); window.removeEventListener('appinstalled', installed); };
  }, []);
  async function installApp() { if (install) { await install.prompt(); if ((await install.userChoice).outcome === 'accepted') setInstall(undefined); } else setInstructions(true); }
  return <>{!online && <div className="offline-banner" role="alert"><WifiOff size={17} /> Jeni pa internet. Porositë dhe pagesat kërkojnë lidhje.</div>}{waiting && <div className="update-banner"><span>Një version i ri është gati. Ruani ndryshimet para rifreskimit.</span><button onClick={() => { navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true }); waiting.postMessage({ type: 'ACTIVATE' }); }}>Përditëso</button></div>}{!hidden && !standalone && (install || ios) && <div ref={banner} className="install-banner"><Smartphone size={21} /><span><strong>Tryeza, në telefonin tuaj</strong><small>Hapeni më shpejt nga ekrani kryesor.</small></span><button className="button primary" onClick={installApp}><Download size={16} /> Instalo</button><button className="icon-button" aria-label="Mbyll njoftimin e instalimit" onClick={() => setHidden(true)}><X size={17} /></button></div>}{instructions && <Modal title="Shtoje në ekranin kryesor" close={() => setInstructions(false)}><p>Në Safari, prekni <strong>Share / Ndaj</strong>, pastaj <strong>Add to Home Screen / Shto në ekranin kryesor</strong> dhe konfirmoni me <strong>Add / Shto</strong>.</p><p className="muted">Aplikacioni do të hapet nga ikona e tij. Porositja kërkon internet.</p></Modal>}</>;
}
