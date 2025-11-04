import { showSuccessToast, showErrorToast, showSuccess , showinfo} from './sweetalert2.js';
const adminPassword = "1111a634526bf55e01a7f1ba4142c1678f22498744a84a73213f52dbe8bb4b68";

window.onload = function() {
    if (localStorage.getItem('isAdmin') === 'true') {
        window.location.href = '/Plantillas/inicio.html';
    }
};

document.getElementById('form_login').addEventListener('submit', function(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('password').value;

    const hashedPassword = CryptoJS.SHA256(passwordInput).toString();
    if (hashedPassword === adminPassword) {
        showSuccess('Acceso concedido. Bienvenido, Administrador.');
        localStorage.setItem('isAdmin', 'true');
        window.location.href = '/Plantillas/inicio.html';
    } else {
        showErrorToast('Contraseña incorrecta. Inténtalo de nuevo.');
    }
});

function verContrasena() {
    showinfo('La contraseña de administrador es: claudia2025');
}
window.verContrasena = verContrasena;