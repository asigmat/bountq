'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext(null);
const styles = {
    success: { icon: CheckCircleIcon, color: 'text-emerald-700', bar: 'bg-emerald-500' },
    error: { icon: ExclamationCircleIcon, color: 'text-rose-700', bar: 'bg-rose-500' },
    info: { icon: InformationCircleIcon, color: 'text-brand-700', bar: 'bg-brand-500' },
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmation, setConfirmation] = useState(null);
    const timerIds = useRef(new Map());

    const dismiss = useCallback((id) => {
        clearTimeout(timerIds.current.get(id));
        timerIds.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback((message, type = 'success') => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((current) => [...current.slice(-3), { id, message, type }]);
        timerIds.current.set(id, setTimeout(() => dismiss(id), 3800));
    }, [dismiss]);

    const confirmAction = useCallback((message, title = 'Onaylıyor musunuz?') => new Promise((resolve) => {
        setConfirmation({ message, title, resolve });
    }), []);

    const settleConfirmation = (result) => {
        confirmation?.resolve(result);
        setConfirmation(null);
    };

    return (
        <ToastContext.Provider value={{ notify, confirmAction }}>
            {children}
            <div className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite" aria-relevant="additions">
                {toasts.map((toast) => {
                    const config = styles[toast.type] || styles.info;
                    const Icon = config.icon;
                    return (
                        <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} className="relative flex items-start gap-3 overflow-hidden rounded-xl border border-gray-100 bg-white p-4 pr-10 shadow-xl shadow-black/10">
                            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                            <p className="text-sm leading-5 text-gray-700">{toast.message}</p>
                            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Bildirimi kapat" className="absolute right-3 top-3 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                            <span className={`absolute inset-x-0 bottom-0 h-0.5 ${config.bar}`} />
                        </div>
                    );
                })}
            </div>
            {confirmation && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) settleConfirmation(false); }}>
                    <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 id="confirm-title" className="text-lg font-semibold text-gray-900">{confirmation.title}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{confirmation.message}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => settleConfirmation(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Vazgeç</button>
                            <button type="button" onClick={() => settleConfirmation(true)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700">Evet, devam et</button>
                        </div>
                    </section>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast, ToastProvider içinde kullanılmalıdır.');
    return context;
}
