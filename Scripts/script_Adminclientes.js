import {showError,showErrorToast,showSuccess,showSuccessToast,showInfoHTML,showinfo, loadSweetAlert2} from './sweetalert2.js'
import {loadSupabase} from './supabase.js';
const Swal = await loadSweetAlert2();
const supabase = await loadSupabase();

function Regresar(){
    window.location.href = "/Plantillas/Inicio.html";
}
window.Regresar = Regresar;

async function agregarCliente(){
    const html = `
    <label for="nombre">Nombre:</label> <input type="text" id="nombre" name="nombre" required> <br> <label for="telefono">Teléfono:</label> <input type="tel" id="telefono" name="telefono" required> <br>`;
    const {value: formValues} = await Swal.fire({
        title: 'Agregar Nuevo Cliente',
        html: html,
        focusConfirm: false,
        preConfirm: () => {
            return {
                nombre: Swal.getPopup().querySelector('#nombre').value,
                telefono: Swal.getPopup().querySelector('#telefono').value
            }
        }
    })
    if (formValues) {
        const {data, error} = await supabase
        .from('Clientes')
        .insert([
            { nombre: formValues.nombre, telefono: formValues.telefono }
        ]);
        if (error) {
            await showErrorToast('Error al agregar el cliente: ' + error.message);
        } else {
            await showSuccessToast('Cliente agregado exitosamente');
        }
    }
}
window.agregarCliente = agregarCliente;