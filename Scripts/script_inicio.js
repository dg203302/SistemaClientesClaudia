import {showError, showSuccess, showErrorToast, showSuccessToast, showinfo, showInfoHTML} from './sweetalert2.js'
import {loadSupabase} from './supabase.js'
const client= await loadSupabase();
let currentOpView = 'deudas'; // 'deudas' | 'pagos'
let isExpanded = false; // controls whether list shows all items or limited

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
// Toggle expand/collapse of operations list. Bound to the Expandir button in HTML.
window.expandirTabla = function(){
    isExpanded = !isExpanded;
    // update button label
    const btn = document.querySelector('button[onclick="expandirTabla()"]');
    if (btn) btn.textContent = isExpanded ? 'Contraer' : 'Expandir';
    // toggle collapsed class for optional CSS visual
    const cont = document.getElementById('lista_operaciones');
    if (cont) cont.classList.toggle('collapsed', !isExpanded);
    // re-render current view
    mostrarOperaciones(currentOpView);
}

// Función invocada desde el enlace "Realizar Operación" en el HTML.
// Muestra un modal para elegir entre registrar Deuda o Pago.
window.realizarOperacion = async function(e){
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    // Asegurarse de que SweetAlert2 esté cargado (window.loadSweetAlert2 está expuesto por sweetalert2.js)
    try{
        if (typeof window.loadSweetAlert2 === 'function') await window.loadSweetAlert2();
    }catch(err){
        console.error('No se pudo cargar SweetAlert2', err);
    }

    // Si Swal está disponible, usarlo para ofrecer opciones.
    if (window.Swal){
        const result = await window.Swal.fire({
            title: 'Registrar Operación',
            text: '¿Qué tipo de operación deseas registrar?',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Registrar Deuda',
            denyButtonText: 'Registrar Pago',
            cancelButtonText: 'Cancelar',
            customClass: { popup: 'swal2-popup' }
        });

        if (result.isConfirmed){
            await openRegistroOperacion('deuda');
        } else if (result.isDenied){
            await openRegistroOperacion('pago');
        }
        return;
    }

    // Fallback si Swal no está disponible
    const choice = confirm('¿Deseas registrar una Deuda? OK = Deuda, Cancel = Pago');
    if (choice) showSuccessToast('Seleccionaste: Registrar Deuda');
    else showSuccessToast('Seleccionaste: Registrar Pago');
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

async function openRegistroOperacion(tipo){
    // tipo: 'deuda' | 'pago'
    await window.loadSweetAlert2();
    const html = `
    <div style="display:grid; gap:8px; text-align:left;">
        <label style="font-weight:600">Buscar Cliente (nombre, apellido o teléfono)</label>
        <input id="clientSearch" class="swal2-input" placeholder="Escribe nombre, apellido o teléfono">
        <div id="clientMatches" style="max-height:120px; overflow:auto;"></div>

        <label style="font-weight:600">Categoría</label>
        <input id="opCategory" class="swal2-input" placeholder="Categoria (p.ej. Servicio, Producto)">

        <label style="font-weight:600">Monto</label>
        <input id="opAmount" class="swal2-input" style="text-align:right; width:70%; font-size:1.5em; font-weight:bold;" value="0"> 
        
        <div id="calc" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:8px;">
            <button type="button" class="calc-btn" data-key="7" style="height:55px;">7</button>
            <button type="button" class="calc-btn" data-key="8" style="height:55px;">8</button>
            <button type="button" class="calc-btn" data-key="9" style="height:55px;">9</button>
            <button type="button" class="calc-op" data-op="+" style="height:55px;">+</button>

            <button type="button" class="calc-btn" data-key="4" style="height:55px;">4</button>
            <button type="button" class="calc-btn" data-key="5" style="height:55px;">5</button>
            <button type="button" class="calc-btn" data-key="6" style="height:55px;">6</button>
            <button type="button" class="calc-op" data-op="-" style="height:55px;">-</button>

            <button type="button" class="calc-btn" data-key="1" style="height:55px;">1</button>
            <button type="button" class="calc-btn" data-key="2" style="height:55px;">2</button>
            <button type="button" class="calc-btn" data-key="3" style="height:55px;">3</button>
            <button type="button" id="calc-clear" style="height:55px; background-color:#d33 !important; color:white;">C</button>
            
            <button type="button" class="calc-btn" data-key="0" style="grid-column: span 2; height:55px;">0</button>
            <button type="button" class="calc-btn" data-key="." style="height:55px;">.</button>
            <button type="button" id="calc-eq" style="height:55px; background-color:#28a745 !important; color:white;">=</button>
        </div>
        <small class="muted">Calculadora: Solo permite Suma (+), Resta (-) e Igual (=)</small>
    </div>
    `;

    const result = await window.Swal.fire({
        title: tipo === 'deuda' ? 'Registrar Deuda' : 'Registrar Pago',
        html,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        showLoaderOnConfirm: true,
        // preConfirm will run the insertion/update while keeping the modal open and showing a loader on the Registrar button
        preConfirm: async () => {
            const nameInput = document.getElementById('clientSearch');
            const catInput = document.getElementById('opCategory');
            const amountInput = document.getElementById('opAmount');
            const name = nameInput ? nameInput.value.trim() : '';
            const categoria = catInput ? catInput.value.trim() : '';
            const monto = amountInput ? parseFloat(amountInput.value) : 0;

            if (isNaN(monto) || monto <= 0) {
                window.Swal.showValidationMessage('Ingrese un monto válido mayor a 0');
                return null;
            }

            // Determinar teléfono seleccionado (si el usuario eligió de la lista)
            const matchesEl = document.getElementById('clientMatches');
            let phoneValue = null;
            if (matchesEl && matchesEl.selectedClient) phoneValue = matchesEl.selectedClient.Telefono ?? null;
            if (!phoneValue) {
                const possible = name || '';
                const digits = (possible.match(/\d+/g) || []).join('');
                if (digits.length >= 6) phoneValue = digits;
            }

            const payload = {
                Monto: monto,
                Categoria: categoria,
                Telefono_cliente: phoneValue,
            };

            try{
                const table = tipo === 'deuda' ? 'Deudas' : 'Pagos';
                const { data, error } = await client.from(table).insert(payload).select();
                if (error){
                    window.Swal.showValidationMessage('Error al registrar: ' + (error.message || error));
                    return null;
                }

                // Actualizar Deuda_Activa según tipo
                if (phoneValue) {
                    const { data: clientData, error: selectError } = await client
                        .from('Clientes')
                        .select('Deuda_Activa')
                        .eq('Telefono', phoneValue)
                        .single();
                    if (selectError) {
                        console.error('Error al obtener deuda actual del cliente', selectError);
                        // No abort registration, but inform user
                        window.Swal.showValidationMessage('Error al obtener datos del cliente: ' + (selectError.message || selectError));
                        return null;
                    }

                    const current = Number(clientData?.Deuda_Activa ?? 0) || 0;
                    if (tipo === 'deuda'){
                        const added = Number(payload.Monto) || 0;
                        const newDeuda = parseFloat((current + added).toFixed(2));
                        const { error: updError } = await client
                            .from('Clientes')
                            .update({ Deuda_Activa: newDeuda })
                            .eq('Telefono', phoneNorm);
                        if (updError){
                            console.error('Error al actualizar deuda del cliente', updError);
                            window.Swal.showValidationMessage('Error al actualizar deuda del cliente: ' + (updError.message || updError));
                            return null;
                        }
                    } else if (tipo === 'pago'){
                        const deducted = Number(payload.Monto) || 0;
                        const newDeuda = parseFloat(Math.max(0, current - deducted).toFixed(2));
                        const { error: updError } = await client
                            .from('Clientes')
                            .update({ Deuda_Activa: newDeuda })
                            .eq('Telefono', phoneValue);
                        if (updError){
                            console.error('Error al actualizar deuda del cliente', updError);
                            window.Swal.showValidationMessage('Error al actualizar deuda del cliente: ' + (updError.message || updError));
                            return null;
                        }
                    }
                }
                return { ok: true };
            }catch(err){
                console.error(err);
                window.Swal.showValidationMessage('Error al registrar la operación');
                return null;
            }
        },
        didOpen: () => {
            // wire up search
            const input = document.getElementById('clientSearch');
            const matches = document.getElementById('clientMatches');
            const amount = document.getElementById('opAmount');

            let debounceTimer = null;

            async function loadMatches(term){
                matches.innerHTML = '';
                matches.selectedClient = null;
                if (!term) return;
                try{
                    const orQuery = `Nombre.ilike.%${term}%,Telefono.ilike.%${term}%`;
                    const { data, error } = await client.from('Clientes').select('Nombre, Telefono').or(orQuery).limit(50);
                    if (error) { console.error(error); matches.innerHTML = '<div class="muted">Error de búsqueda</div>'; return; }
                    if (!data || data.length === 0) { matches.innerHTML = '<div class="muted">No hay coincidencias</div>'; return; }
                    
                    data.forEach(c => {
                        const div = document.createElement('div');
                        div.style.padding = '6px';
                        div.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
                        div.style.cursor = 'pointer';
                        // NOTA: Se asume que la función escapeHtml está definida.
                        div.innerHTML = `<strong>${escapeHtml(c.Nombre ?? '')} ${escapeHtml(c.Apellido ?? '')}</strong><br><small class="muted">${escapeHtml(c.Telefono ?? '')}</small>`;
                        div.addEventListener('click', () => {
                            input.value = `${c.Nombre ?? ''} ${c.Apellido ?? ''}`.trim() || (c.Telefono ?? '');
                            matches.selectedClient = c; 
                            matches.innerHTML = '';
                            input.focus();
                        });
                        matches.appendChild(div);
                    });
                }catch(err){
                    console.error('Busqueda clientes error', err);
                    matches.innerHTML = '<div class="muted">Error de búsqueda</div>';
                }
            }

            if (input) {
                input.addEventListener('input', () => {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => loadMatches(input.value.trim()), 250);
                });
                if (input.value && input.value.trim()) loadMatches(input.value.trim());
            }

            // --- LÓGICA DE CALCULADORA (Solo + y -) ---
            const btns = document.querySelectorAll('#calc .calc-btn');
            const ops = document.querySelectorAll('#calc .calc-op');
            const eq = document.getElementById('calc-eq');
            const clear = document.getElementById('calc-clear');
            
            let currentDisplay = '0';
            let firstOperand = null;
            let operator = null;
            let waitingForSecondOperand = false;

            function updateDisplay(value) {
                currentDisplay = String(value);
                amount.value = currentDisplay; 
            }

            function calculate(first, second, op) {
                first = parseFloat(first);
                second = parseFloat(second);
                // **SOLO SUMA Y RESTA**
                if (op === '+') return first + second;
                if (op === '-') return first - second;
                
                return second; // Si no hay operador válido, devuelve el segundo operando.
            }

            function handleDigit(digit) {
                if (waitingForSecondOperand) {
                    currentDisplay = digit;
                    waitingForSecondOperand = false;
                } else {
                    if (currentDisplay === '0') currentDisplay = digit;
                    else currentDisplay += digit;
                }
                updateDisplay(currentDisplay);
            }

            function handleDecimal() {
                if (waitingForSecondOperand) {
                    currentDisplay = '0.';
                    waitingForSecondOperand = false;
                    updateDisplay(currentDisplay);
                    return;
                }
                if (!currentDisplay.includes('.')) {
                    currentDisplay += '.';
                }
                updateDisplay(currentDisplay);
            }

            function handleOperator(nextOperator) {
                // Solo permitimos + y -
                if (nextOperator !== '+' && nextOperator !== '-') return;
                
                const inputValue = parseFloat(currentDisplay);

                if (operator && waitingForSecondOperand) {
                    operator = nextOperator;
                    return;
                }

                if (firstOperand === null) {
                    firstOperand = inputValue;
                } else if (operator) {
                    const result = calculate(firstOperand, inputValue, operator);
                    firstOperand = result;
                    updateDisplay(firstOperand.toFixed(2));
                }

                waitingForSecondOperand = true;
                operator = nextOperator;
            }

            function handleEquals() {
                if (operator === null || waitingForSecondOperand) {
                    return;
                }
                const inputValue = parseFloat(currentDisplay);
                let secondOperand = inputValue;
                
                const result = calculate(firstOperand, secondOperand, operator);
                
                updateDisplay(result.toFixed(2)); 
                firstOperand = result;
                operator = null;
                waitingForSecondOperand = true;
            }

            function clearCalculator() {
                currentDisplay = '0';
                firstOperand = null;
                operator = null;
                waitingForSecondOperand = false;
                updateDisplay(currentDisplay);
            }

            // Event Listeners
            btns.forEach(b => b.addEventListener('click', () => {
                const k = b.dataset.key;
                if (k === '.') {
                    handleDecimal();
                } else {
                    handleDigit(k);
                }
            }));

            ops.forEach(o => o.addEventListener('click', () => {
                handleOperator(o.dataset.op);
            }));

            if (eq) eq.addEventListener('click', handleEquals);
            if (clear) clear.addEventListener('click', clearCalculator);

            // Sincronizar el input de monto con la lógica de la calculadora al inicio
            if (amount.value !== '0') {
                currentDisplay = amount.value;
            }
        }
    });

    // Si el preConfirm devolvió ok, mostrar toast y recargar UI
    if (result && result.isConfirmed && result.value && result.value.ok) {
        showSuccessToast('Operación registrada correctamente');
        try { await recargarMontos(); } catch(e){}
        try { await recargarTabla(); } catch(e){}
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
    // If not expanded, show up to 4 items. Otherwise show up to 50 (safety cap).
    const visibleItems = isExpanded ? items.slice(0,50) : items.slice(0,4);
    visibleItems.forEach(item => {
        const fechaRaw = item.Creado || item.creado || item.fecha || item.created_at || '';
        const fecha = formatDate(fechaRaw);
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
        // click to show details
        card.addEventListener('click', () => showOperacionDetalle(item, tipo));
        container.appendChild(card);
    });
    // If collapsed and there are more items, show a clickable indicator
    if (!isExpanded && items.length > 4){
        const more = document.createElement('div');
        more.className = 'more-indicator';
        more.textContent = `Mostrar ${items.length - 4} registros más`;
        more.addEventListener('click', () => {
            // toggle expansion via the same function
            window.expandirTabla && window.expandirTabla();
        });
        container.appendChild(more);
    }
}

function escapeHtml(str){
    return str.replace(/[&<>"]+/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function formatDate(value){
    if (!value) return '';
    // Try to parse common date formats
    const d = new Date(value);
    if (!isNaN(d)){
        try{
            return d.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
        }catch(e){
            return d.toString();
        }
    }
    // If it's a numeric timestamp
    const n = Number(value);
    if (!Number.isNaN(n)){
        const d2 = new Date(n);
        if (!isNaN(d2)) return d2.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
    }
    return String(value);
}

async function showOperacionDetalle(item, tipo) {
    // 1. Build the HTML summary using <strong> and <br>
    const lines = [];

    // Flatten known fields (case-insensitive)
    const montoRaw = item.Monto ?? item.monto ?? item.Amount ?? item.amount ?? '';
    // Asegúrate de que escapeHtml y formatDate estén definidas en tu entorno
    const monto = escapeHtml(String(montoRaw)); 

    const creadoRaw = item.Creado ?? item.creado ?? item.fecha ?? item.created_at ?? '';
    const creado = escapeHtml(formatDate(creadoRaw));

    // --- Campos Principales ---
    const cliente = item.Cliente ?? item.cliente ?? item.client;
    if (cliente !== undefined && cliente !== null && String(cliente).trim() !== '') {
        // Usamos <strong> para la negrita en HTML
        lines.push(`<strong>Cliente:</strong> ${escapeHtml(String(cliente))}`);
    }

    // Llama a la función asíncrona para obtener el nombre
    const nombreCliente = await obtenerNombreCliente(item.Telefono_cliente);
    if (nombreCliente) {
        lines.push(`<strong>Nombre Cliente:</strong> ${escapeHtml(String(nombreCliente))}`);
    }

    // Incluimos el tipo de operación, que se había perdido en la versión anterior
    lines.push(`<strong>Tipo:</strong> ${tipo === 'deudas' ? 'Deuda' : 'Pago'}`);
    
    lines.push(`<strong>Monto:</strong> ${monto}`);
    lines.push(`<strong>Fecha:</strong> ${creado}`);

    // --- Otros Campos ---
    const ignored = new Set([
        'Monto', 'monto', 'Amount', 'amount',
        'Creado', 'creado', 'fecha', 'created_at',
        'Cliente', 'cliente', 'client', 'Telefono_cliente'
    ]);

    Object.keys(item).forEach((k) => {
        if (ignored.has(k)) return;
        const v = item[k];
        let display;
        if (v === null || v === undefined) {
            display = '';
        } else if (typeof v === 'object') {
            try {
                display = JSON.stringify(v);
            } catch (e) {
                display = String(v);
            }
        } else {
            display = String(v);
        }
        // Usamos <strong> y </strong> para la clave
        lines.push(`<strong>${escapeHtml(String(k))}:</strong> ${escapeHtml(display)}`);
    });

    // 2. Unir las líneas con <br> (salto de línea de HTML)
    const htmlContent = lines.join('<br>');

    // 3. Usar Swal.fire con la opción 'html'
    try {
        await showInfoHTML(htmlContent);
    } catch (e) {
        // Fallback a alert: convierte el HTML a texto plano con \n
        const textPlain = htmlContent.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
        alert(textPlain);
    }
}

async function obtenerNombreCliente(telefono) {
    if (!telefono) return null;
    const { data, error } = await client
      .from('Clientes')
      .select('Nombre')
      .eq('Telefono', telefono)
      .single();

    if (error) {
        showError('Error al obtener el nombre del cliente:', error);
        return null;
    }
    return data?.Nombre ?? null;
}

async function recargarTabla() {
    if (currentOpView) {
        await mostrarOperaciones(currentOpView);
    }
}
async function cargarMontoAdeudadoMensual(){
    const { data, error } = await client
      .from('Clientes')
      .select('Deuda_Activa');
    if (error) {
      showErrorToast(error.message);
      return 0;
    }
    console.log(data);
    const totalMensual = (data || []).reduce((acc, row) => acc + (Number(row.Deuda_Activa) || 0), 0);
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