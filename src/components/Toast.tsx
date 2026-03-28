import { useApp } from '@/context/AppContext';

export default function Toast() {
  const { toastMessage, toastVisible } = useApp();

  return (
    <div
      className={`fixed top-[52px] left-1/2 z-[3000] bg-green-dim border border-primary rounded-full px-5 py-2.5 font-mono text-[11px] text-primary tracking-[1px] whitespace-nowrap transition-transform duration-300 ${
        toastVisible ? 'toast-show' : 'toast-enter'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {toastMessage}
    </div>
  );
}
