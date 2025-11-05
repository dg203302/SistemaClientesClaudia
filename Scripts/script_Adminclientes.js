import {showError,showErrorToast,showSuccess,showSuccessToast,showInfoHTML,showinfo} from './sweetalert2.js'
import {loadSupabase} from './supabase.js';

function Regresar(){
    window.location.href = "/Plantillas/Inicio.html";
}

window.Regresar = Regresar;