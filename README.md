# AutoBox · Control de garaje

Web en español, sin dependencias ni servicios externos. Datos locales en el navegador. Usa el mismo navegador y dirección para conservar el acceso a los registros.

## Abrir

Ejecuta `npm start` y abre http://localhost:4173. La publicación HTTPS permite instalarla en un celular y usarla sin conexión después de la primera carga completa. Espera el indicador «Disponible sin conexión» antes de desconectarte. En Android usa Instalar aplicación; en iPhone, Safari → Compartir → Añadir a pantalla de inicio.

La versión `dist/AutoBox-portatil.html` incluye todo en un archivo sin dependencias. Transfiérelo al dispositivo y ábrelo en un navegador que permita archivos HTML locales y almacenamiento. En celulares la PWA instalada es la opción recomendada. La versión portátil y la web guardan datos por separado; transfiérelos con un respaldo.

## Operar

- Entrada: placa, categoría, registrar. Evita placas duplicadas y respeta la capacidad configurada.
- Tickets: empieza en 1–1000; genera más, imprime rangos o ajusta el siguiente número. Cada número se usa una vez; se conservan los registros anteriores.
- Salida: busca placa o ticket, revisa tiempo y tarifa, aplica exoneración con motivo, registra pago o deuda.
- Historial: consulta movimientos y registra pagos de deudas. La caja usa la fecha del pago.
- Ajustes: nombre, capacidad, moneda, tarifas por bloque de 15, 30 o 60 minutos y tolerancia. Las condiciones se guardan en cada entrada.
- Respaldo JSON o CSV: ambos conservan registros y configuración. Importar reemplaza los datos locales después de mostrar resumen y descargar una copia previa. No hay sincronización entre dispositivos.

## Tarifas

Por defecto: S/ 5 auto, S/ 3 moto, S/ 7 camioneta por hora iniciada; 10 min de tolerancia; capacidad 40. Configúralo según el negocio. Hasta la tolerancia inicial no se cobra; luego se factura `ceil((minutos − tolerancia) / bloque)`. Ejemplo con hora y tolerancia 10: 70 min = una hora; 71 min = dos horas. «Perdonar última fracción» descuenta un bloque cuando se cobraron dos o más, conservando el bruto, total y motivo.

## Respaldo y privacidad

LocalStorage guarda los datos. El borrado del navegador, modo privado o cambio de origen puede perderlos. Descarga un respaldo al cerrar tu jornada. La instalación offline requiere que el navegador conserve la caché. No hay cuentas de cajeros ni sincronización automática.

## Verificación

`npm test`: cálculo en los límites, tolerancia, tickets, ida y vuelta CSV/JSON y rechazo de datos inconsistentes. `npm run portable`: reconstruye el archivo portátil tras cambiar código. Sin proceso de compilación para la web.
