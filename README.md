# AutoBox · Control de garaje

Web en español, sin dependencias ni servicios externos. Datos locales en el navegador. Usa el mismo navegador y dirección para conservar el acceso a los registros.

## Abrir

Ejecuta `npm start` y abre http://localhost:4173. La publicación HTTPS permite instalarla en un celular y usarla sin conexión después de la primera carga completa. Espera el indicador «Disponible sin conexión» antes de desconectarte. En Android usa Instalar aplicación; en iPhone, Safari → Compartir → Añadir a pantalla de inicio.

La versión `dist/AutoBox-portatil.html` incluye todo en un archivo sin dependencias. Transfiérelo al dispositivo y ábrelo en un navegador que permita archivos HTML locales y almacenamiento. En celulares la PWA instalada es la opción recomendada. La versión portátil y la web guardan datos por separado; transfiérelos con un respaldo.

En Android, el HTML abierto por el explorador (`content://…`) no se instala como PWA y puede bloquear la cámara. Para instalación y cámara, abre el enlace HTTPS directamente en Chrome, usa Ajustes → Usar sin internet → Instalar AutoBox, o el menú de Chrome → Agregar a pantalla principal → Instalar. El botón muestra instrucciones cuando Chrome aún no ofrece el aviso nativo. Espera «Disponible sin conexión» antes de desconectarte. Si el permiso de cámara fue rechazado, revisa Configuración del sitio → Cámara → Permitir. Los iconos PNG de 192 y 512 píxeles y el icono maskable están incluidos en la caché sin conexión.

## Operar

En Cobrar, el selector Ticket / Placa separa la búsqueda: Ticket acepta 5 o 00005 y coincide solo con el número exacto del boleto; Placa busca únicamente en las placas, incluso si escribes números. Cambiar la opción limpia la consulta. Al salir de Cobrar también se limpia. Escanear un QR selecciona automáticamente Ticket.

- Navegación inferior: Inicio, Registrar, Cobrar y Ajustes. El historial se abre desde Inicio, y los tickets desde Ajustes.
- Registrar: solo talonario, placa, categoría y registro. «Ajustar folio» permite elegir el boleto en mano o leer su QR. «Saltar ticket» permite avanzar a otro número sin registrar vehículos ni cobros (por ejemplo, de 00001 a 00005 si se perdió un boleto). Evita placas duplicadas y respeta la capacidad configurada.
- «Dejó llave» es un interruptor opcional en Registrar. Se muestra en Cobrar y en el detalle; se conserva en JSON y en la columna `dejo_llave` del CSV. Los respaldos antiguos sin esa opción siguen siendo compatibles.
- La búsqueda en Cobrar e Historial reconoce números con y sin ceros iniciales (1 y 00001). El ojo junto a Cobrar abre el detalle de cualquier vehículo dentro y permite anular su registro si no se entregó el boleto. El título de los boletos usa negrita y los bordes de corte son rectos y continuos.
- Ajustes → Tickets: empieza en 1–1000; genera más, previsualiza e imprime rangos con o sin QR, o ajusta el siguiente número. Cada número se usa una vez; se conservan los registros anteriores.
- Cobrar: busca placa o ticket, revisa tiempo y tarifa y aplica exoneración con motivo si corresponde. «Ya pagó» registra el ingreso; «No pagó» cierra la salida sin dinero recibido y sin deuda pendiente. El importe se conserva como no cobrado, separado de caja.
- Anular registro: desde Ver ticket o Cobrar, anula cuando el vehículo se retira y el boleto físico todavía no se entregó. Libera la placa y devuelve el número al talonario. No cuenta como entrada, salida ni cobro; queda identificado como Anulado en el historial y en los respaldos. El mismo número puede asignarse a otro vehículo.
- Historial: consulta Dentro, Pagado, No pagó y Anulado. La caja usa la fecha del pago. Los registros antiguos con estado pendiente se convierten a No pagó al abrir o importar la copia.
- El detalle del ticket no imprime comprobantes. La única impresión de la app es la de boletos preparados desde Ajustes → Tickets.
- Ajustes: nombre, capacidad, moneda, tarifas por bloque de 15, 30 o 60 minutos y tolerancia. Las condiciones se guardan en cada entrada.
- Respaldo JSON o CSV: ambos conservan registros y configuración. Importar reemplaza los datos locales después de mostrar resumen y descargar una copia previa. No hay sincronización entre dispositivos.

## Tickets y QR

El boleto compacto solo muestra TICKET, el número grande con al menos cinco dígitos (00001, 00002…) y un QR real opcional. Permite 15, 20 o 30 tickets por A4 (20 por defecto), con guías de corte en los bordes. El QR contiene únicamente el código del ticket, por ejemplo `TK-01001-ABX`; no requiere internet ni abre enlaces. Los QR anteriores con seis dígitos siguen siendo compatibles. En Cobrar, «Escanear QR del ticket» busca la estancia activa exacta y abre su cobro. El lector abre la cámara directamente al tocar Escanear QR; Chrome puede pedir permiso la primera vez. Un QR desconocido o un ticket ya salido no registra ninguna operación. El registro requiere confirmar la placa, incluso si se seleccionó el ticket por QR.

## Compartir la versión local

La entrega local incluye `AutoBox.html` y `AutoBox-para-WhatsApp.zip`. Envía uno de ellos como documento por WhatsApp; si usas el ZIP, descomprímelo. Abre el HTML en un navegador que ejecute JavaScript y permita almacenamiento local. La vista previa de WhatsApp o del gestor de archivos puede no ejecutar la aplicación. El archivo incluye todo lo necesario y no necesita cuentas ni conexión. La cámara depende del soporte del navegador para archivos locales; para escanear, usa la versión HTTPS instalada. Cada copia y navegador guarda datos propios: transfiere los registros con Exportar/Importar, no enviando solo el HTML.

Los archivos de qrcode-generator 2.0.4 (MIT) y jsQR 1.4.0 (Apache-2.0) están incluidos en `dist/vendor`, junto con sus licencias. No se descargan bibliotecas en tiempo de uso; están incluidas también en la copia portátil y en la caché sin conexión. La cámara necesita un navegador compatible, HTTPS o localhost y permiso del usuario.

## Tarifas

Por defecto: S/ 5 auto, S/ 3 moto, S/ 7 camioneta por hora iniciada; 10 min de tolerancia; capacidad 40. Configúralo según el negocio. Hasta la tolerancia inicial no se cobra; luego se factura `ceil((minutos − tolerancia) / bloque)`. Ejemplo con hora y tolerancia 10: 70 min = una hora; 71 min = dos horas. «Perdonar última fracción» descuenta un bloque cuando se cobraron dos o más, conservando el bruto, total y motivo.

## Respaldo y privacidad

LocalStorage guarda los datos. El borrado del navegador, modo privado o cambio de origen puede perderlos. Descarga un respaldo al cerrar tu jornada. La instalación offline requiere que el navegador conserve la caché. No hay cuentas de cajeros ni sincronización automática.

## Verificación

`npm test`: cálculo en los límites, tolerancia, tickets, ida y vuelta CSV/JSON, rechazo de datos inconsistentes y lectura real de matrices QR generadas para números pequeños y grandes. `npm run portable`: reconstruye el archivo portátil tras cambiar código. Sin proceso de compilación para la web.

## Publicación en GitHub Pages

En Ajustes → Datos y respaldo, «Compartir respaldo por WhatsApp» abre el menú de compartir del celular. Elige WhatsApp y el chat de destino. La copia contiene todos los datos y ajustes; en el otro celular se importa desde la misma sección. Si el navegador solo admite compartir texto, se envía un TXT con el mismo respaldo JSON, también importable. Si no admite compartir archivos, se descarga el JSON para adjuntarlo como documento. Cancelar el menú conserva los datos y no marca la copia como compartida.

Web: https://mariosc21.github.io/autobox-garaje/
Repositorio: https://github.com/MarioSC21/autobox-garaje

Cada cambio en main ejecuta las pruebas, genera el HTML portátil y publica dist mediante GitHub Actions. No requiere ChatGPT Sites ni un servidor propio.

Al cambiar de dirección, los datos no se trasladan automáticamente: en la app anterior abre Ajustes → Datos y respaldo → Descargar copia completa; en la nueva dirección importa ese archivo. Conserva la app anterior hasta comprobar el respaldo. Luego instala la nueva web desde Chrome.
