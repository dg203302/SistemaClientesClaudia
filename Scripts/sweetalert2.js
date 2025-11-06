let __swalPromise = null;

function ensureSwal() {
    if (typeof window !== 'undefined' && window.Swal) {
        return Promise.resolve(window.Swal);
    }
    if (__swalPromise) return __swalPromise;

    __swalPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-lib="sweetalert2"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.Swal));
            existing.addEventListener('error', (e) => reject(new Error('Failed to load SweetAlert2 script.')));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js';
        script.async = true;
        script.defer = true;
        script.dataset.lib = 'sweetalert2';
        script.onload = () => resolve(window.Swal);
        script.onerror = (error) => {
            console.error('Error loading SweetAlert2:', error);
            reject(new Error('Failed to load SweetAlert2 script.'));
        };
        document.head.appendChild(script);
    });

    return __swalPromise;
}

function loadSweetAlert2() {
    return ensureSwal();
}

async function showSuccess(title, text) {
    const Swal = await ensureSwal();
    return Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

async function showError(title, text) {
    const Swal = await ensureSwal();
    return Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonText: 'Aceptar'
    });
}

async function showSuccessToast(message) {
    const Swal = await ensureSwal();
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        // Asegurar que quede por encima de headers/botones fijos
        zIndex: 20000
    });
    return Toast.fire({ icon: 'success', title: message });
}

async function showErrorToast(message) {
    const Swal = await ensureSwal();
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        // Asegurar que quede por encima de headers/botones fijos
        zIndex: 20000
    });
    return Toast.fire({ icon: 'error', title: message });
}

async function showInfo(message) {
    const Swal = await ensureSwal();
    return Swal.fire({
        title: 'Información',
        text: message,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
}

async function showInfoHTML(message) {
    const Swal = await ensureSwal();
    return Swal.fire({
        title: 'Información',
        html: message,
        icon: 'info',
        confirmButtonText: 'Aceptar'
    });
}

if (typeof window !== 'undefined') {
    window.loadSweetAlert2 = loadSweetAlert2;
}
export { ensureSwal as loadSweetAlert2, showSuccess, showError, showSuccessToast, showErrorToast };
export { showInfo as showinfo, showInfoHTML };