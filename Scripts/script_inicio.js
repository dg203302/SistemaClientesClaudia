import {showError, showSuccess, showErrorToast, showSuccessToast, showinfo} from './sweetalert2.js'
import {loadSupabase} from './supabase.js'
const client= await loadSupabase();
window.onload = async function() {
    showSuccessToast('Bienvenido de nuevo!');
};
window.cerrarSesion=function() {
    localStorage.clear();
    window.location.href = "/index.html";
}
async function cargarOperacionesRecientes(){
    return;
}
async function cargarMontoAdeudadoMensual(){
    return;
}