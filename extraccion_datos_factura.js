// Texto del PDF
const textoPDFF = `8/2/24, 18:09 .:: Factura Electronica - Impresion ::.
https://ww1.sunat.gob.pe/ol-ti-itemisionfactura/emitir.do?action=imprimirComprobante&preventCache=1707433772202 1/1
FACTURA ELECTRONICA
RUC: 10420936643
E001-428
Sub Total
Ventas : S/ 6.78
Anticipos : S/ 0.00
Descuentos : S/ 0.00
Valor Venta : S/ 6.78
ISC : S/ 0.00
IGV : S/ 1.22
ICBPER : S/ 0.00
Otros Cargos : S/ 0.00
Otros Tributos : S/ 0.00
Monto de
redondeo : S/ 0.00
Importe Total : S/ 8.00
ANTARES INFORMATIC
TORO FENCO EVERHT ANTONIO
CAL. SAN JOSE 375 INT. 10 GALERIAS EL ESTUDIANTE STAND 10
CHICLAYO - CHICLAYO - LAMBAYEQUE
Fecha de Emisión : 08/02/2024
Señor(es) :
PLANEAMIENTO Y CONTROL
TRIBUTARIO BCJ S.A.C
RUC : 20488099796
Dirección del Cliente :
AV. JOSE LEONARDO ORTIZ 144
URB. LOS PARQUES
LAMBAYEQUE-CHICLAYOCHICLAYO
Tipo de Moneda : SOLES
Observación :
Forma de pago : Contado
Cantidad Unidad Medida Descripción Valor Unitario ICBPER
1.00 UNIDAD CABLE HDMI 6.78 0.00
Valor de Venta de
Operaciones Gratuitas : S/ 0.00
SON: OCHO Y 00/100 SOLES
Esta es una representación impresa de la factura electrónica, generada en el Sistema de SUNAT. Puede verificarla utilizando su
clave SOL.`;
// Especificar la ruta del worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.8.335/pdf.worker.min.js';
let textoPDF = `...`;

async function handleFileSelect(event) {
    const file = event.target.files[0];
    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
    const pdf = await loadingTask.promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join('\n') + '\n';
    }
    textoPDF=text;
    console.log(textoPDF);
    document.getElementById('output').textContent = text;
}
// Dividir el texto del PDF por líneas
const lineas = textoPDF.split('\n');

// Objeto para almacenar los datos
const datosFactura = {};

// Procesar cada línea del texto del PDF
lineas.forEach(linea => {
    // Dividir la línea por ':' para obtener la clave y el valor
    const partes = linea.split(':');
    if (partes.length === 2) {
        // Eliminar espacios en blanco al principio y al final de la clave y el valor
        const clave = partes[0].trim();
        const valor = partes[1].trim();
        // Asignar el valor al objeto de datos de la factura
        datosFactura[clave] = valor;
    }
});

// Imprimir los datos de la factura en la consola
console.log('datosFactura',datosFactura);
