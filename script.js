pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

const fileInput = document.getElementById('fileInput');
const outputDiv = document.getElementById('output');
const jsonOutput = document.getElementById('jsonOutput');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const pdfData = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(pdfData).promise.then(function(pdf) {
            pdf.getPage(1).then(function(page) {
                page.getTextContent().then(function(textContent) {
                    const text = textContent.items.map(function(item) {
                        return item.str;
                        
                    }).join(' ');
                    console.log(text);
                    const jsonData = extractDataFromText(text);
                    outputDiv.textContent = ''; 
                    jsonOutput.textContent = JSON.stringify(jsonData, null, 2);
                });
            });
        });
    };

    reader.readAsArrayBuffer(file);
});

function extractDataFromText(text) {
    const jsonData = {
        "datos_emisor": {
            "tipo_comprobante": "",
            "nombre_comercial": "",
            "nombre_emisor": "",
            "domicilio_fiscal": "",
            "lugar": "",
            "fecha_emision": "",
            "ruc_emisor": "",
            "nro_factura": ""
        },
        "datos_cliente": {
            "nombre_cliente": "",
            "ruc_cliente": "",
            "direccion_cliente": "",
            "tipo_moneda": "",
            "observacion": "",
            "forma_pago": ""
        },
        "datos_venta": [
            {
                "cantidad": "",
                "unidad_medida": "",
                "descripcion": "",
                "valor_unitario": "",
                "icbper": ""
            }
        ],
        "resumen_importe": {
            "subtotal_venta": "",
            "anticipos": "",
            "descuentos": "",
            "valor_venta": "",
            "isc": "",
            "igv": "",
            "icbper_total": "",
            "otros_cargos": "",
            "valor_venta_ope_grat": "",
            "otros_tributos": "",
            "montos_redondeo": "",
            "importe_total": ""
        }
    };

    // Extraer datos del texto
    const emisorRegex = /FACTURA ELECTRONICA RUC:\s*(\d+)\s*(.*?)Fecha de Emisión\s*:\s*(\d{2}\/\d{2}\/\d{4})\s*(.*?)RUC\s*:\s*(\d+)\s*(.*?)Tipo de Moneda\s*:\s*(.*?)\s*(.*?)Forma de pago\s*:\s*(.*)/s;
    const emisorMatch = text.match(emisorRegex);
    if (emisorMatch) {
        jsonData.datos_emisor.tipo_comprobante = "FACTURA ELECTRONICA";
        jsonData.datos_emisor.ruc_emisor = emisorMatch[1].trim();
        jsonData.datos_emisor.fecha_emision = emisorMatch[3].trim();
        const emisorInfo = emisorMatch[2].split(/\s{2,}/);
        jsonData.datos_emisor.nombre_emisor = emisorInfo[0].trim();
        jsonData.datos_emisor.domicilio_fiscal = emisorInfo.slice(1, -1).join(' ').trim();
        jsonData.datos_emisor.lugar = emisorInfo[emisorInfo.length - 1].trim();
    }

    const clienteRegex = /Señor\(es\)\s*:\s*(.*?)\s*RUC\s*:\s*(\d+)\s*(.*?)Dirección del Cliente\s*:\s*(.*?)\s*(.*?)Tipo de Moneda\s*:\s*(.*?)\s*(.*?)Observación\s*:\s*(.*?)\s*(.*?)Forma de pago\s*:\s*(.*)\s*(.*?)Cantidad\s*Unidad Medida\s*Descripción\s*Valor Unitario\s*ICBPER\s*(\d+\.\d+)\s+(\w+)\s*(.*?)\s*(\d+\.\d+)\s*(\d+\.\d+)/s;
    const clienteMatch = text.match(clienteRegex);
    if (clienteMatch) {
        jsonData.datos_cliente.nombre_cliente = clienteMatch[1].trim();
        jsonData.datos_cliente.ruc_cliente = clienteMatch[2].trim();
        jsonData.datos_cliente.direccion_cliente = clienteMatch[4].trim();
        jsonData.datos_cliente.tipo_moneda = clienteMatch[6].trim();
        jsonData.datos_cliente.observacion = clienteMatch[8].trim();
        jsonData.datos_cliente.forma_pago = clienteMatch[10] ? clienteMatch[10].trim() : '';

        const ventaRegex = /Cantidad\s*Unidad Medida\s*Descripción\s*Valor Unitario\s*ICBPER\s*(\d+\.\d+)\s+(\w+)\s*(.*?)\s*(\d+\.\d+)\s*(\d+\.\d+)/s;
        const ventaMatch = text.match(ventaRegex);
        if (ventaMatch) {
            jsonData.datos_venta[0].cantidad = ventaMatch[1].trim();
            jsonData.datos_venta[0].unidad_medida = ventaMatch[2].trim();
            jsonData.datos_venta[0].descripcion = ventaMatch[3].trim();
            jsonData.datos_venta[0].valor_unitario = ventaMatch[4].trim();
            jsonData.datos_venta[0].icbper = ventaMatch[5].trim();
        }
    }

    // Actualizar resumen de importe
    const importeRegex = /Sub Total Ventas\s*:\s*S\/\s*(\d+\.\d+)\s*Anticipos\s*:\s*S\/\s*(\d+\.\d+)\s*Descuentos\s*:\s*S\/\s*(\d+\.\d+)\s*Valor Venta\s*:\s*S\/\s*(\d+\.\d+)\s*ISC\s*:\s*S\/\s*(\d+\.\d+)\s*IGV\s*:\s*S\/\s*(\d+\.\d+)\s*ICBPER\s*:\s*S\/\s*(\d+\.\d+)\s*Otros Cargos\s*:\s*S\/\s*(\d+\.\d+)\s*Otros Tributos\s*:\s*S\/\s*(\d+\.\d+)\s*Monto de redondeo\s*:\s*S\/\s*(\d+\.\d+)\s*Importe Total\s*:\s*S\/\s*(\d+\.\d+)/s;
    const importeMatch = text.match(importeRegex);
    if (importeMatch) {
        jsonData.resumen_importe.subtotal_venta = importeMatch[1].trim();
        jsonData.resumen_importe.anticipos = importeMatch[2].trim();
        jsonData.resumen_importe.descuentos = importeMatch[3].trim();
        jsonData.resumen_importe.valor_venta = importeMatch[4].trim();
        jsonData.resumen_importe.isc = importeMatch[5].trim();
        jsonData.resumen_importe.igv = importeMatch[6].trim();
        jsonData.resumen_importe.icbper_total = importeMatch[7].trim();
        jsonData.resumen_importe.otros_cargos = importeMatch[8].trim();
        jsonData.resumen_importe.otros_tributos = importeMatch[9].trim();
        jsonData.resumen_importe.montos_redondeo = importeMatch[10].trim();
        jsonData.resumen_importe.importe_total = importeMatch[11].trim();
    }

    return jsonData;
}
