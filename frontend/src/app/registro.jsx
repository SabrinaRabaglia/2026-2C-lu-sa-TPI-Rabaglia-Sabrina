import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BotonPrimario } from '@/components/BotonPrimario';
import { useSesion } from '@/context/SesionContext';
import { useRegistrarUsuario } from '@/hooks/useUsuarios';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const esquemaRegistro = z
  .object({
    nombre: z
      .string({ error: 'Ingresá tu nombre' })
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z
      .string({ error: 'Ingresá tu apellido' })
      .trim()
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z
      .string({ error: 'Ingresá tu email' })
      .trim()
      .email('Ingresá un email válido'),
    password: z
      .string({ error: 'Ingresá una contraseña' })
      .min(4, 'La contraseña debe tener al menos 4 caracteres'),
    confirmarPassword: z
      .string({ error: 'Confirmá tu contraseña' })
      .min(4, 'Confirmá tu contraseña'),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export default function PantallaRegistro() {
  const enrutador = useRouter();
  const { iniciarSesion } = useSesion();
  const mutacionRegistro = useRegistrarUsuario();

  const [rolInicial, setRolInicial] = useState('COMPRADOR');
  const [errorServidor, setErrorServidor] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmarPassword: '',
    },
  });

  const alEnviarRegistro = async (valores) => {
    setErrorServidor('');
    try {
      const nuevoUsuario = await mutacionRegistro.mutateAsync({
        nombre: valores.nombre.trim(),
        apellido: valores.apellido.trim(),
        email: valores.email.trim().toLowerCase(),
        password: valores.password,
        rol: rolInicial,
      });

      await iniciarSesion(nuevoUsuario.id, rolInicial);
      enrutador.replace(
        rolInicial === 'COMPRADOR' ? '/(comprador)' : '/(organizador)'
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No pudimos crear la cuenta. Intentá nuevamente.';
      setErrorServidor(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('No se pudo completar el registro', msg);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={estilos.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.contenidoScroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Creá tu cuenta en AI Ticket It</Text>
          <Text style={estilos.subtitulo}>
            Completá tus datos para empezar a comprar entradas o publicar eventos.
          </Text>

          {errorServidor ? (
            <View style={estilos.cajaError}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={colores.peligro}
              />
              <Text style={estilos.textoCajaError}>{errorServidor}</Text>
            </View>
          ) : null}

          <View style={estilos.dosColumnas}>
            <View style={[estilos.campo, estilos.flex]}>
              <Text style={estilos.etiqueta}>Nombre *</Text>
              <Controller
                control={control}
                name="nombre"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Ej: Sabrina"
                    placeholderTextColor={colores.textoSecundario}
                    accessibilityLabel="Nombre"
                    style={estilos.entrada}
                  />
                )}
              />
              {errors.nombre ? (
                <Text style={estilos.textoError}>{errors.nombre.message}</Text>
              ) : null}
            </View>

            <View style={[estilos.campo, estilos.flex]}>
              <Text style={estilos.etiqueta}>Apellido *</Text>
              <Controller
                control={control}
                name="apellido"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Ej: Rabaglia"
                    placeholderTextColor={colores.textoSecundario}
                    accessibilityLabel="Apellido"
                    style={estilos.entrada}
                  />
                )}
              />
              {errors.apellido ? (
                <Text style={estilos.textoError}>
                  {errors.apellido.message}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.etiqueta}>Email *</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={(txt) => {
                    setErrorServidor('');
                    onChange(txt);
                  }}
                  onBlur={onBlur}
                  placeholder="sabrina@ejemplo.com"
                  placeholderTextColor={colores.textoSecundario}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email"
                  style={estilos.entrada}
                />
              )}
            />
            {errors.email ? (
              <Text style={estilos.textoError}>{errors.email.message}</Text>
            ) : null}
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.etiqueta}>Contraseña (mínimo 4 caracteres) *</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••"
                  placeholderTextColor={colores.textoSecundario}
                  secureTextEntry
                  autoCapitalize="none"
                  accessibilityLabel="Contraseña"
                  style={estilos.entrada}
                />
              )}
            />
            {errors.password ? (
              <Text style={estilos.textoError}>{errors.password.message}</Text>
            ) : null}
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.etiqueta}>Repetir contraseña *</Text>
            <Controller
              control={control}
              name="confirmarPassword"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••"
                  placeholderTextColor={colores.textoSecundario}
                  secureTextEntry
                  autoCapitalize="none"
                  accessibilityLabel="Confirmar contraseña"
                  style={estilos.entrada}
                />
              )}
            />
            {errors.confirmarPassword ? (
              <Text style={estilos.textoError}>
                {errors.confirmarPassword.message}
              </Text>
            ) : null}
          </View>

          <View style={estilos.campo}>
            <Text style={estilos.etiqueta}>¿Con qué perfil querés empezar?</Text>
            <View style={estilos.selectorRol}>
              <Pressable
                onPress={() => setRolInicial('COMPRADOR')}
                accessibilityRole="button"
                accessibilityLabel="Empezar como Comprador"
                accessibilityState={{ selected: rolInicial === 'COMPRADOR' }}
                style={[
                  estilos.opcionRol,
                  rolInicial === 'COMPRADOR' && estilos.opcionRolActiva,
                ]}
              >
                <Ionicons
                  name="ticket-outline"
                  size={16}
                  color={
                    rolInicial === 'COMPRADOR'
                      ? colores.textoPrimario
                      : colores.textoSecundario
                  }
                />
                <Text
                  style={[
                    estilos.textoOpcionRol,
                    rolInicial === 'COMPRADOR' && estilos.textoOpcionRolActiva,
                  ]}
                >
                  Comprador
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRolInicial('ORGANIZADOR')}
                accessibilityRole="button"
                accessibilityLabel="Empezar como Organizador"
                accessibilityState={{ selected: rolInicial === 'ORGANIZADOR' }}
                style={[
                  estilos.opcionRol,
                  rolInicial === 'ORGANIZADOR' && estilos.opcionRolActiva,
                ]}
              >
                <Ionicons
                  name="megaphone-outline"
                  size={16}
                  color={
                    rolInicial === 'ORGANIZADOR'
                      ? colores.textoPrimario
                      : colores.textoSecundario
                  }
                />
                <Text
                  style={[
                    estilos.textoOpcionRol,
                    rolInicial === 'ORGANIZADOR' &&
                      estilos.textoOpcionRolActiva,
                  ]}
                >
                  Organizador
                </Text>
              </Pressable>
            </View>
          </View>

          <BotonPrimario
            etiqueta="Crear cuenta e ingresar"
            cargando={mutacionRegistro.isPending}
            alPresionar={handleSubmit(alEnviarRegistro)}
          />

          <View style={estilos.filaLogin}>
            <Text style={estilos.textoLogin}>¿Ya tenés una cuenta?</Text>
            <Pressable
              onPress={() => enrutador.back()}
              accessibilityRole="button"
              accessibilityLabel="Volver a iniciar sesión"
            >
              <Text style={estilos.enlaceLogin}>Iniciá sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  flex: {
    flex: 1,
  },
  contenidoScroll: {
    padding: espaciado.lg,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
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
  cajaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: colores.peligroFondo,
    padding: espaciado.md,
    borderRadius: bordes.md,
  },
  textoCajaError: {
    flex: 1,
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.peligro,
  },
  dosColumnas: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  campo: {
    gap: espaciado.xs,
  },
  etiqueta: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.texto,
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
  selectorRol: {
    flexDirection: 'row',
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    padding: espaciado.xs,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  opcionRol: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.xs,
    borderRadius: bordes.sm,
  },
  opcionRolActiva: {
    backgroundColor: colores.primario,
  },
  textoOpcionRol: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoOpcionRolActiva: {
    color: colores.textoPrimario,
  },
  textoError: {
    fontSize: tipografia.xs,
    color: colores.peligro,
    fontWeight: '600',
  },
  filaLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.xs,
    paddingTop: espaciado.xs,
  },
  textoLogin: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
  },
  enlaceLogin: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primario,
  },
});
