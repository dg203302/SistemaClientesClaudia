import {showError, showSuccess, showErrorToast, showSuccessToast, showinfo} from './sweetalert2.js'

window.onload = function() {
    showSuccessToast('Bienvenido de nuevo!');
};
window.cerrarSesion=function() {
    localStorage.clear();
    window.location.href = "/index.html";
}