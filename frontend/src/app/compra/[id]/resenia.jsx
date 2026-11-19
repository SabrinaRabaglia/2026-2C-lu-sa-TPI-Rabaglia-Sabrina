import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BotonPrimario } from '@/components/BotonPrimario';
import { EstrellasPuntaje } from '@/components/EstrellasPuntaje';
import { useSesion } from '@/context/SesionContext';
import { useCompra } from '@/hooks/useCompras';
import { useCrearResenia } from '@/hooks/useResenias';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const esquemaResenia = z.object({
  puntuacion: z
    .number({ error: 'Seleccioná una puntuación de 1 a 5 estrellas' })
    .min(1, 'La puntuación mínima es 1 estrella')
    .max(5, 'La puntuación máxima es 5 estrellas'),
  detalle: z
    .string({ error: 'Escribí un comentario sobre tu experiencia' })
    .trim()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede superar los 500 caracteres'),
});

export default function PantallaCrearResenia() {
  const { id } = useLocalSearchParams();
  const enrutador = useRouter();
  const { usuarioId } = useSesion();

  const consultaCompra = useCompra(id);
  const mutacionCrearResenia = useCrearResenia();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaResenia),
    defaultValues: {
      puntuacion: 5,
      detalle: '',
    },
  });

  const alEnviarFormulario = async (valores) => {
    try {
      await mutacionCrearResenia.mutateAsync({
        compraId: id,
        compradorId: usuarioId,
        puntuacion: valores.puntuacion,
        detalle: valores.detalle,
      });
      Alert.alert(
        '¡Gracias por tu reseña!',
        'Tu calificación ya está visible en el perfil y los eventos del organizador.'
      );
      enrutador.back();
    } catch (err) {
      Alert.alert(
        'No se pudo publicar la reseña',
        err instanceof Error ? err.message : 'Error inesperado'
      );
    }
  };

  const nombreEvento = consultaCompra.data?.evento?.nombre || 'el evento';

  return (
    <ScrollView style={estilos.pantalla} contentContainerStyle={estilos.contenido}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.titulo}>¿Cómo estuvo {nombreEvento}?</Text>
        <Text style={estilos.subtitulo}>
          Tu calificación ayuda a futuros compradores a conocer la reputación del organizador.
        </Text>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>Puntaje general (1 a 5 estrellas)</Text>
          <Controller
            control={control}
            name="puntuacion"
            render={({ field: { value, onChange } }) => (
              <View style={estilos.filaEstrellas}>
                <EstrellasPuntaje
                  puntaje={value}
                  tamanio={34}
                  interactivo
                  alCambiar={onChange}
                />
                <Text style={estilos.insigniaPuntaje}>{value} / 5</Text>
              </View>
            )}
          />
          {errors.puntuacion ? (
            <Text style={estilos.textoError}>{errors.puntuacion.message}</Text>
          ) : null}
        </View>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>Tu comentario</Text>
          <Controller
            control={control}
            name="detalle"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Contanos cómo fue la organización, la puntualidad, el sonido..."
                placeholderTextColor={colores.textoSecundario}
                accessibilityLabel="Comentario de la reseña"
                multiline
                numberOfLines={5}
                maxLength={500}
                style={estilos.areaTexto}
              />
            )}
          />
          {errors.detalle ? (
            <Text style={estilos.textoError}>{errors.detalle.message}</Text>
          ) : null}
        </View>

        <BotonPrimario
          etiqueta="Publicar calificación"
          cargando={mutacionCrearResenia.isPending}
          alPresionar={handleSubmit(alEnviarFormulario)}
        />
      </View>
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
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.lg,
    ...sombras.tarjeta,
  },
  titulo: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    lineHeight: 20,
  },
  bloqueCampo: {
    gap: espaciado.sm,
  },
  etiqueta: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
  },
  filaEstrellas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
  },
  insigniaPuntaje: {
    fontSize: tipografia.md,
    fontWeight: '700',
    color: colores.primario,
  },
  areaTexto: {
    minHeight: 120,
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: espaciado.md,
    fontSize: tipografia.sm,
    color: colores.texto,
    textAlignVertical: 'top',
  },
  textoError: {
    fontSize: tipografia.xs,
    color: colores.peligro,
    fontWeight: '600',
  },
});
