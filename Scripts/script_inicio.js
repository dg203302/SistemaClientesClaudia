import {showError, showSuccess, showErrorToast, showSuccessToast, showinfo} from './sweetalert2.js'
import {loadSupabase} from './supabase.js'
const client= await loadSupabase();
let currentOpView = 'deudas'; // 'deudas' | 'pagos'

window.onload = async function() {
    showSuccessToast('Bienvenido de nuevo!');
    await cargarMontoAdeudadoMensual();
    prepararTabsOperaciones();
    await mostrarOperaciones('deudas');
};
window.cerrarSesion=function() {
    localStorage.clear();
    window.location.href = "/index.html";
}
async function cargarPagosRecientes(){
    const { data, error } = await client
        .from('Pagos')
        .select('*')
        .order('Creado', { ascending: false });
    if (error){
        showErrorToast(error.message);
        return [];
    }
    console.log(data);
    return data || [];
}

async function cargarDeudasRecientes(){
    const { data, error } = await client
        .from('Deudas')
        .select('*')
        .order('Creado', { ascending: false });
    if (error){
        showErrorToast(error.message);
        return [];
    }
    console.log(data);
    return data || [];
}

function prepararTabsOperaciones(){
    const btnDeudas = document.getElementById('btn_ver_deudas');
    const btnPagos = document.getElementById('btn_ver_pagos');
    if (!btnDeudas || !btnPagos) return;

    btnDeudas.addEventListener('click', async () => {
        if (currentOpView === 'deudas') return;
        setActiveTab('deudas');
        await mostrarOperaciones('deudas');
    });
    btnPagos.addEventListener('click', async () => {
        if (currentOpView === 'pagos') return;
        setActiveTab('pagos');
        await mostrarOperaciones('pagos');
    });
}

function setActiveTab(tipo){
    currentOpView = tipo;
    const btnDeudas = document.getElementById('btn_ver_deudas');
    const btnPagos = document.getElementById('btn_ver_pagos');
    if (btnDeudas && btnPagos){
        btnDeudas.classList.toggle('active', tipo === 'deudas');
        btnDeudas.setAttribute('aria-selected', String(tipo === 'deudas'));
        btnPagos.classList.toggle('active', tipo === 'pagos');
        btnPagos.setAttribute('aria-selected', String(tipo === 'pagos'));
    }
}

async function mostrarOperaciones(tipo){
    const cont = document.getElementById('lista_operaciones');
    if (!cont) return;
    cont.textContent = 'Cargando...';
    try{
        const items = tipo === 'deudas' ? await cargarDeudasRecientes() : await cargarPagosRecientes();
        renderListaOperaciones(cont, items, tipo);
    }catch(err){
        console.error(err);
        showErrorToast('No se pudieron cargar las operaciones');
        cont.textContent = 'Error al cargar.';
    }
}

function renderListaOperaciones(container, items, tipo){
    container.innerHTML = '';
    if (!items || items.length === 0){
        const empty = document.createElement('div');
        empty.textContent = 'No hay registros.';
        container.appendChild(empty);
        return;
    }
    const formatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
    items.slice(0, 10).forEach(item => {
        const fecha = item.Creado || item.creado || item.fecha || item.created_at || '';
        const montoRaw = item.Monto ?? item.monto ?? item.Amount ?? item.amount ?? 0;
        const monto = Number(montoRaw) || 0;
        const card = document.createElement('div');
        card.className = 'op-item';
        card.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
                <div>
                    <div style="font-weight:600; color:${tipo==='deudas' ? 'var(--danger)' : 'var(--success)'}">${tipo==='deudas' ? 'Deuda' : 'Pago'}</div>
                    <div class="muted" style="font-size:0.85rem;">${escapeHtml(String(fecha))}</div>
                </div>
                <div style="font-weight:700;">${formatter.format(monto)}</div>
            </div>
        `;
        container.appendChild(card);
    });
}

function escapeHtml(str){
    return str.replace(/[&<>"]+/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
async function recargarTabla() {
    if (currentOpView) {
        await mostrarOperaciones(currentOpView);
    }
}
async function cargarMontoAdeudadoMensual(){
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

        const { data, error } = await client
      .from('Deudas')
      .select('Monto')
      .gte('Creado', startOfMonth)
      .lt('Creado', startOfNextMonth);

    if (error) {
      showErrorToast(error.message);
      return 0;
    }
    console.log(data);
    const totalMensual = (data || []).reduce((acc, row) => acc + (Number(row.Monto ?? row.monto) || 0), 0);
    const indicadorMonto = document.getElementById('total_adeudado_mes');
    indicadorMonto.textContent = totalMensual.toFixed(2);
    actualizarColor(indicadorMonto);
    return;
}
function actualizarColor(indicador){
    const valor = parseFloat(indicador.textContent);
    if (valor === 0) {
        indicador.style.color = 'white';
    } else if (valor > 0 && valor <=100000){
        indicador.style.color = 'green';
    }
    else if (valor > 100000 && valor <= 300000){
        indicador.style.color = 'orange';
    }
    else{
        indicador.style.color = 'red';
    }
}
async function recargarMontos(){
    await cargarMontoAdeudadoMensual();
}
window.recargarMontos=recargarMontos;
window.recargarTabla = recargarTabla;