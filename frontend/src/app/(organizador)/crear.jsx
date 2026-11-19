import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BotonPrimario } from '@/components/BotonPrimario';
import { useSesion } from '@/context/SesionContext';
import { useCategorias } from '@/hooks/useCategorias';
import { useCrearEvento } from '@/hooks/useEventos';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const PORTADAS_SUGERIDAS = [
  {
    etiqueta: 'Recital / Rock',
    url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=900&q=80',
  },
  {
    etiqueta: 'Teatro / Stand-up',
    url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=900&q=80',
  },
  {
    etiqueta: 'Conferencia / Tech',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
  },
  {
    etiqueta: 'Jazz / Acústico',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
  },
];

function obtenerFechaFuturaPorDefecto(diasAdelante = 14) {
  const fecha = new Date(Date.now() + diasAdelante * 24 * 60 * 60 * 1000);
  fecha.setUTCHours(21, 0, 0, 0);
  return fecha.toISOString().slice(0, 16).replace('T', ' ');
}

function parsearFechaFuturaFlexible(valor) {
  const normalizado = valor.trim().replace(' ', 'T');
  const conZona =
    normalizado.endsWith('Z') || normalizado.includes('+')
      ? normalizado
      : `${normalizado}:00.000Z`;
  return new Date(conZona);
}

const esquemaCrearEvento = z.object({
  nombre: z
    .string({ error: 'El título del evento es obligatorio' })
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z
    .string()
    .trim()
    .min(10, 'Agregá una descripción de al menos 10 caracteres'),
  categoriaId: z
    .string({ error: 'Seleccioná una categoría' })
    .min(1, 'Seleccioná una categoría'),
  fechaTexto: z
    .string({ error: 'Ingresá la fecha y hora del evento' })
    .trim()
    .refine(
      (val) => {
        const parseada = parsearFechaFuturaFlexible(val);
        return (
          !Number.isNaN(parseada.getTime()) && parseada.getTime() > Date.now()
        );
      },
      {
        message:
          'Ingresá una fecha futura válida con formato AAAA-MM-DD HH:mm (ej. 2027-06-15 21:00)',
      }
    ),
  tiposEntrada: z
    .array(
      z.object({
        nombre: z.string().trim().min(1, 'El nombre del tipo es obligatorio'),
        descripcion: z.string().optional(),
        precioTexto: z
          .string()
          .trim()
          .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, {
            message: 'El precio debe ser mayor a 0',
          }),
        cupoTexto: z
          .string()
          .trim()
          .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
            message: 'El cupo debe ser un entero mayor a 0',
          }),
      })
    )
    .min(1, 'Agregá al menos un tipo de entrada')
    .refine(
      (items) => {
        const nombres = items.map((i) => i.nombre.trim().toLowerCase());
        return new Set(nombres).size === nombres.length;
      },
      {
        message: 'No puede haber dos tipos de entrada con el mismo nombre',
      }
    ),
});

export default function PantallaCrearEvento() {
  const enrutador = useRouter();
  const { usuarioId } = useSesion();
  const consultaCategorias = useCategorias();
  const mutacionCrearEvento = useCrearEvento();

  const [imagenes, setImagenes] = useState([PORTADAS_SUGERIDAS[0].url]);
  const [urlPersonalizada, setUrlPersonalizada] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaCrearEvento),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoriaId: '',
      fechaTexto: obtenerFechaFuturaPorDefecto(14),
      tiposEntrada: [
        {
          nombre: 'General',
          descripcion: 'Acceso general al evento',
          precioTexto: '20000',
          cupoTexto: '100',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tiposEntrada',
  });

  const categoriaSeleccionadaId = watch('categoriaId');

  const manejarAgregarImagen = (url) => {
    const limpia = url.trim();
    if (!limpia) return;
    if (imagenes.length >= 5) {
      Alert.alert(
        'Límite alcanzado',
        'Podés agregar hasta 5 imágenes por evento.'
      );
      return;
    }
    if (!imagenes.includes(limpia)) {
      setImagenes((previas) => [...previas, limpia]);
    }
    setUrlPersonalizada('');
  };

  const manejarQuitarImagen = (url) => {
    setImagenes((previas) => previas.filter((item) => item !== url));
  };

  const alEnviarFormulario = async (valores) => {
    if (!usuarioId) return;
    try {
      const fechaParseada = parsearFechaFuturaFlexible(valores.fechaTexto);
      const creado = await mutacionCrearEvento.mutateAsync({
        nombre: valores.nombre.trim(),
        descripcion: valores.descripcion.trim(),
        categoriaId: valores.categoriaId,
        fecha: fechaParseada.toISOString(),
        tiposEntrada: valores.tiposEntrada.map((t) => ({
          nombre: t.nombre.trim(),
          descripcion: t.descripcion?.trim() || '',
          precio: Number(t.precioTexto),
          cupo: Number(t.cupoTexto),
        })),
        multimedia:
          imagenes.length > 0 ? imagenes : [PORTADAS_SUGERIDAS[0].url],
        organizadorId: usuarioId,
      });

      reset();
      enrutador.push(`/evento/${creado.id}`);
    } catch (err) {
      Alert.alert(
        'No se pudo publicar el evento',
        err instanceof Error ? err.message : 'Error inesperado'
      );
    }
  };

  const categorias = consultaCategorias.data || [];

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.tituloSeccion}>Datos del evento</Text>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Título del evento *</Text>
          <Controller
            control={control}
            name="nombre"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ej: Festival de Indie & Rock 2027"
                placeholderTextColor={colores.textoSecundario}
                accessibilityLabel="Título del evento"
                style={estilos.entrada}
              />
            )}
          />
          {errors.nombre ? (
            <Text style={estilos.textoError}>{errors.nombre.message}</Text>
          ) : null}
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Categoría *</Text>
          <View style={estilos.grillaCategorias}>
            {categorias.map((cat) => {
              const activa = categoriaSeleccionadaId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    setValue('categoriaId', cat.id, { shouldValidate: true })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar categoría ${cat.nombre}`}
                  accessibilityState={{ selected: activa }}
                  style={[estilos.chipCat, activa && estilos.chipCatActiva]}
                >
                  <Text
                    style={[
                      estilos.textoChipCat,
                      activa && estilos.textoChipCatActiva,
                    ]}
                  >
                    {cat.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.categoriaId ? (
            <Text style={estilos.textoError}>{errors.categoriaId.message}</Text>
          ) : null}
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>
            Fecha y hora (AAAA-MM-DD HH:mm) *
          </Text>
          <Controller
            control={control}
            name="fechaTexto"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="2027-06-20 21:00"
                placeholderTextColor={colores.textoSecundario}
                accessibilityLabel="Fecha y hora del evento"
                style={estilos.entrada}
              />
            )}
          />
          <View style={estilos.filaFechasRapidas}>
            {[7, 14, 30].map((dias) => (
              <Pressable
                key={dias}
                onPress={() =>
                  setValue('fechaTexto', obtenerFechaFuturaPorDefecto(dias), {
                    shouldValidate: true,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Fijar fecha en ${dias} días`}
                style={estilos.chipFechaRapida}
              >
                <Text style={estilos.textoFechaRapida}>+{dias} días</Text>
              </Pressable>
            ))}
          </View>
          {errors.fechaTexto ? (
            <Text style={estilos.textoError}>{errors.fechaTexto.message}</Text>
          ) : null}
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.etiqueta}>Descripción *</Text>
          <Controller
            control={control}
            name="descripcion"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Describí la grilla, ubicación, horarios y recomendaciones..."
                placeholderTextColor={colores.textoSecundario}
                accessibilityLabel="Descripción del evento"
                multiline
                numberOfLines={4}
                style={[estilos.entrada, estilos.areaTexto]}
              />
            )}
          />
          {errors.descripcion ? (
            <Text style={estilos.textoError}>{errors.descripcion.message}</Text>
          ) : null}
        </View>
      </View>

      {/* Imágenes / Multimedia */}
      <View style={estilos.tarjeta}>
        <Text style={estilos.tituloSeccion}>
          Imágenes de portada ({imagenes.length}/5)
        </Text>
        <Text style={estilos.textoAyuda}>
          Podés elegir portadas sugeridas o pegar una URL de imagen.
        </Text>

        <View style={estilos.filaSugeridas}>
          {PORTADAS_SUGERIDAS.map((sugerida) => (
            <Pressable
              key={sugerida.url}
              onPress={() => manejarAgregarImagen(sugerida.url)}
              accessibilityRole="button"
              accessibilityLabel={`Agregar portada ${sugerida.etiqueta}`}
              style={estilos.chipSugerida}
            >
              <Ionicons
                name="image-outline"
                size={14}
                color={colores.primario}
              />
              <Text style={estilos.textoChipSugerida}>{sugerida.etiqueta}</Text>
            </Pressable>
          ))}
        </View>

        <View style={estilos.filaUrl}>
          <TextInput
            value={urlPersonalizada}
            onChangeText={setUrlPersonalizada}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor={colores.textoSecundario}
            accessibilityLabel="URL de imagen personalizada"
            style={[estilos.entrada, { flex: 1 }]}
          />
          <BotonPrimario
            etiqueta="Agregar"
            variante="secundario"
            deshabilitado={!urlPersonalizada.trim() || imagenes.length >= 5}
            alPresionar={() => manejarAgregarImagen(urlPersonalizada)}
          />
        </View>

        {imagenes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.filaMiniaturas}
          >
            {imagenes.map((uri) => (
              <View key={uri} style={estilos.contenedorMiniatura}>
                <Image
                  source={{ uri }}
                  style={estilos.imagenMiniatura}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => manejarQuitarImagen(uri)}
                  accessibilityRole="button"
                  accessibilityLabel="Quitar imagen"
                  style={estilos.botonQuitarMiniatura}
                >
                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={colores.peligro}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* Tipos de entrada dinámicos */}
      <View style={estilos.tarjeta}>
        <View style={estilos.encabezadoEntradas}>
          <Text style={estilos.tituloSeccion}>Tipos de entrada *</Text>
          <Pressable
            onPress={() =>
              append({
                nombre: '',
                descripcion: '',
                precioTexto: '25000',
                cupoTexto: '50',
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Agregar tipo de entrada"
            style={estilos.botonAgregarEntrada}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colores.primario}
            />
            <Text style={estilos.textoAgregarEntrada}>Agregar tipo</Text>
          </Pressable>
        </View>

        {fields.map((campo, indice) => {
          const erroresItem = errors.tiposEntrada?.[indice];
          return (
            <View key={campo.id} style={estilos.cajaEntrada}>
              <View style={estilos.encabezadoCajaEntrada}>
                <Text style={estilos.tituloCajaEntrada}>
                  Entrada #{indice + 1}
                </Text>
                {fields.length > 1 ? (
                  <Pressable
                    onPress={() => remove(indice)}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar entrada número ${indice + 1}`}
                    style={estilos.botonEliminarEntrada}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colores.peligro}
                    />
                  </Pressable>
                ) : null}
              </View>

              <Controller
                control={control}
                name={`tiposEntrada.${indice}.nombre`}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Nombre (ej. Campo General, Platea, VIP)"
                    placeholderTextColor={colores.textoSecundario}
                    accessibilityLabel={`Nombre del tipo de entrada ${indice + 1}`}
                    style={estilos.entrada}
                  />
                )}
              />
              {erroresItem?.nombre ? (
                <Text style={estilos.textoError}>
                  {erroresItem.nombre.message}
                </Text>
              ) : null}

              <Controller
                control={control}
                name={`tiposEntrada.${indice}.descripcion`}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Descripción opcional (ej. Ubicación preferencial)"
                    placeholderTextColor={colores.textoSecundario}
                    accessibilityLabel={`Descripción del tipo de entrada ${indice + 1}`}
                    style={estilos.entrada}
                  />
                )}
              />

              <View style={estilos.dosColumnas}>
                <View style={estilos.columna}>
                  <Text style={estilos.etiquetaChica}>Precio (ARS) *</Text>
                  <Controller
                    control={control}
                    name={`tiposEntrada.${indice}.precioTexto`}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        placeholder="25000"
                        placeholderTextColor={colores.textoSecundario}
                        accessibilityLabel={`Precio de la entrada ${indice + 1}`}
                        style={estilos.entrada}
                      />
                    )}
                  />
                  {erroresItem?.precioTexto ? (
                    <Text style={estilos.textoError}>
                      {erroresItem.precioTexto.message}
                    </Text>
                  ) : null}
                </View>

                <View style={estilos.columna}>
                  <Text style={estilos.etiquetaChica}>Cupo disponible *</Text>
                  <Controller
                    control={control}
                    name={`tiposEntrada.${indice}.cupoTexto`}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        keyboardType="numeric"
                        placeholder="100"
                        placeholderTextColor={colores.textoSecundario}
                        accessibilityLabel={`Cupo de la entrada ${indice + 1}`}
                        style={estilos.entrada}
                      />
                    )}
                  />
                  {erroresItem?.cupoTexto ? (
                    <Text style={estilos.textoError}>
                      {erroresItem.cupoTexto.message}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}

        {errors.tiposEntrada?.root?.message || errors.tiposEntrada?.message ? (
          <Text style={estilos.textoError}>
            {errors.tiposEntrada?.root?.message || errors.tiposEntrada?.message}
          </Text>
        ) : null}
      </View>

      <BotonPrimario
        etiqueta="Publicar evento"
        cargando={mutacionCrearEvento.isPending}
        alPresionar={handleSubmit(alEnviarFormulario)}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  tituloSeccion: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.texto,
  },
  textoAyuda: {
    fontSize: tipografia.xs,
    color: colores.textoSecundario,
  },
  campo: {
    gap: espaciado.xs,
  },
  etiqueta: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  etiquetaChica: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  entrada: {
    minHeight: 46,
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    fontSize: tipografia.sm,
    color: colores.texto,
  },
  areaTexto: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  grillaCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  chipCat: {
    minHeight: 40,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    justifyContent: 'center',
  },
  chipCatActiva: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  textoChipCat: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.texto,
  },
  textoChipCatActiva: {
    color: colores.textoPrimario,
  },
  filaFechasRapidas: {
    flexDirection: 'row',
    gap: espaciado.sm,
    marginTop: 4,
  },
  chipFechaRapida: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
  },
  textoFechaRapida: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primario,
  },
  filaSugeridas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  chipSugerida: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
  },
  textoChipSugerida: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.primario,
  },
  filaUrl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  filaMiniaturas: {
    gap: espaciado.sm,
    paddingTop: espaciado.xs,
  },
  contenedorMiniatura: {
    width: 88,
    height: 66,
    borderRadius: bordes.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  imagenMiniatura: {
    width: '100%',
    height: '100%',
  },
  botonQuitarMiniatura: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: bordes.completo,
  },
  encabezadoEntradas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonAgregarEntrada: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaciado.sm,
  },
  textoAgregarEntrada: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primario,
  },
  cajaEntrada: {
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
    gap: espaciado.sm,
  },
  encabezadoCajaEntrada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloCajaEntrada: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  botonEliminarEntrada: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dosColumnas: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  columna: {
    flex: 1,
    gap: 4,
  },
  textoError: {
    fontSize: tipografia.xs,
    color: colores.peligro,
    fontWeight: '600',
  },
});
