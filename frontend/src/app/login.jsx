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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BotonPrimario } from '@/components/BotonPrimario';
import { useSesion } from '@/context/SesionContext';
import { useLoginUsuario } from '@/hooks/useUsuarios';
import { bordes, colores, espaciado, sombras, tipografia } from '@/tema';

const CUENTAS_DEMO = [
  {
    etiqueta: 'Lucía (Compradora)',
    email: 'lucia@ticketit.com',
    password: '123456',
    modo: 'COMPRADOR',
  },
  {
    etiqueta: 'Mateo (Comprador)',
    email: 'mateo@ticketit.com',
    password: '123456',
    modo: 'COMPRADOR',
  },
  {
    etiqueta: 'Valentina (Compradora)',
    email: 'valentina@ticketit.com',
    password: '123456',
    modo: 'COMPRADOR',
  },
  {
    etiqueta: 'Martín (Organizador)',
    email: 'martin@ticketit.com',
    password: '123456',
    modo: 'ORGANIZADOR',
  },
  {
    etiqueta: 'Sofía (Organizadora)',
    email: 'sofia@ticketit.com',
    password: '123456',
    modo: 'ORGANIZADOR',
  },
  {
    etiqueta: 'Diego (Organizador)',
    email: 'diego@ticketit.com',
    password: '123456',
    modo: 'ORGANIZADOR',
  },
];

const esquemaLogin = z.object({
  email: z
    .string({ error: 'Ingresá tu email' })
    .trim()
    .email('Ingresá un email válido'),
  password: z
    .string({ error: 'Ingresá tu contraseña' })
    .min(1, 'Ingresá tu contraseña'),
});

export default function PantallaLogin() {
  const enrutador = useRouter();
  const { iniciarSesion } = useSesion();
  const mutacionLogin = useLoginUsuario();

  const [modoSeleccionado, setModoSeleccionado] = useState('COMPRADOR');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaLogin),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const manejarAutocompletarDemo = (cuenta) => {
    setErrorServidor('');
    setValue('email', cuenta.email, { shouldValidate: true });
    setValue('password', cuenta.password, { shouldValidate: true });
    setModoSeleccionado(cuenta.modo);
  };

  const alEnviarLogin = async (valores) => {
    setErrorServidor('');
    try {
      const usuarioAutenticado = await mutacionLogin.mutateAsync({
        email: valores.email,
        password: valores.password,
      });

      const modoIngreso =
        modoSeleccionado || usuarioAutenticado.rol || 'COMPRADOR';
      await iniciarSesion(usuarioAutenticado.id, modoIngreso);
      enrutador.replace(
        modoIngreso === 'COMPRADOR' ? '/(comprador)' : '/(organizador)'
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No pudimos iniciar sesión. Revisá tus datos.';
      setErrorServidor(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('No se pudo iniciar sesión', msg);
      }
    }
  };

  return (
    <SafeAreaView style={estilos.areaSegura}>
      <KeyboardAvoidingView
        style={estilos.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.contenidoScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={estilos.encabezado}>
            <View style={estilos.insigniaLogo}>
              <Ionicons name="ticket" size={28} color={colores.textoPrimario} />
            </View>
            <Text style={estilos.titulo}>AI Ticket It</Text>
            <Text style={estilos.subtitulo}>
              Iniciá sesión para comprar entradas o gestionar tus eventos
            </Text>
          </View>

          <View style={estilos.tarjeta}>
            <Text style={estilos.tituloTarjeta}>Iniciar sesión</Text>

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

            <View style={estilos.campo}>
              <Text style={estilos.etiqueta}>Email</Text>
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
                    placeholder="tu@email.com"
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
              <Text style={estilos.etiqueta}>Contraseña</Text>
              <View style={estilos.contenedorPassword}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value}
                      onChangeText={(txt) => {
                        setErrorServidor('');
                        onChange(txt);
                      }}
                      onBlur={onBlur}
                      placeholder="••••••"
                      placeholderTextColor={colores.textoSecundario}
                      secureTextEntry={!mostrarPassword}
                      autoCapitalize="none"
                      accessibilityLabel="Contraseña"
                      style={estilos.entradaPassword}
                    />
                  )}
                />
                <Pressable
                  onPress={() => setMostrarPassword((prev) => !prev)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    mostrarPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  style={estilos.botonOjo}
                >
                  <Ionicons
                    name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colores.textoSecundario}
                  />
                </Pressable>
              </View>
              {errors.password ? (
                <Text style={estilos.textoError}>
                  {errors.password.message}
                </Text>
              ) : null}
            </View>

            <View style={estilos.campo}>
              <Text style={estilos.etiqueta}>Ingresar en modo</Text>
              <View style={estilos.selectorModo}>
                <Pressable
                  onPress={() => setModoSeleccionado('COMPRADOR')}
                  accessibilityRole="button"
                  accessibilityLabel="Modo Comprador"
                  accessibilityState={{
                    selected: modoSeleccionado === 'COMPRADOR',
                  }}
                  style={[
                    estilos.opcionModo,
                    modoSeleccionado === 'COMPRADOR' &&
                      estilos.opcionModoActiva,
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={
                      modoSeleccionado === 'COMPRADOR'
                        ? colores.textoPrimario
                        : colores.textoSecundario
                    }
                  />
                  <Text
                    style={[
                      estilos.textoOpcionModo,
                      modoSeleccionado === 'COMPRADOR' &&
                        estilos.textoOpcionModoActiva,
                    ]}
                  >
                    Comprador
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setModoSeleccionado('ORGANIZADOR')}
                  accessibilityRole="button"
                  accessibilityLabel="Modo Organizador"
                  accessibilityState={{
                    selected: modoSeleccionado === 'ORGANIZADOR',
                  }}
                  style={[
                    estilos.opcionModo,
                    modoSeleccionado === 'ORGANIZADOR' &&
                      estilos.opcionModoActiva,
                  ]}
                >
                  <Ionicons
                    name="megaphone-outline"
                    size={16}
                    color={
                      modoSeleccionado === 'ORGANIZADOR'
                        ? colores.textoPrimario
                        : colores.textoSecundario
                    }
                  />
                  <Text
                    style={[
                      estilos.textoOpcionModo,
                      modoSeleccionado === 'ORGANIZADOR' &&
                        estilos.textoOpcionModoActiva,
                    ]}
                  >
                    Organizador
                  </Text>
                </Pressable>
              </View>
            </View>

            <BotonPrimario
              etiqueta="Iniciar sesión"
              cargando={mutacionLogin.isPending}
              alPresionar={handleSubmit(alEnviarLogin)}
            />

            <View style={estilos.filaRegistro}>
              <Text style={estilos.textoRegistro}>¿No tenés una cuenta?</Text>
              <Pressable
                onPress={() => enrutador.push('/registro')}
                accessibilityRole="button"
                accessibilityLabel="Ir al formulario de registro"
              >
                <Text style={estilos.enlaceRegistro}>Registrate acá</Text>
              </Pressable>
            </View>
          </View>

          {/* Accesos rápidos para autocompletar usuarios de prueba durante la demo */}
          <View style={estilos.tarjetaDemo}>
            <Text style={estilos.tituloDemo}>
              Cuentas de prueba (tocá para autocompletar)
            </Text>
            <View style={estilos.grillaDemo}>
              {CUENTAS_DEMO.map((cuenta) => (
                <Pressable
                  key={cuenta.email}
                  onPress={() => manejarAutocompletarDemo(cuenta)}
                  accessibilityRole="button"
                  accessibilityLabel={`Autocompletar ${cuenta.etiqueta}`}
                  style={estilos.chipDemo}
                >
                  <Ionicons
                    name={
                      cuenta.modo === 'COMPRADOR'
                        ? 'ticket-outline'
                        : 'megaphone-outline'
                    }
                    size={14}
                    color={colores.primario}
                  />
                  <Text style={estilos.textoChipDemo}>{cuenta.etiqueta}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  flex: {
    flex: 1,
  },
  contenidoScroll: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  encabezado: {
    alignItems: 'center',
    paddingTop: espaciado.md,
    gap: espaciado.xs,
  },
  insigniaLogo: {
    width: 56,
    height: 56,
    borderRadius: bordes.lg,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.xs,
  },
  titulo: {
    fontSize: tipografia.xl,
    fontWeight: '700',
    color: colores.texto,
  },
  subtitulo: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    ...sombras.tarjeta,
  },
  tituloTarjeta: {
    fontSize: tipografia.lg,
    fontWeight: '700',
    color: colores.texto,
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
  contenedorPassword: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    borderWidth: 1,
    borderColor: colores.borde,
    minHeight: 46,
  },
  entradaPassword: {
    flex: 1,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    fontSize: tipografia.sm,
    color: colores.texto,
  },
  botonOjo: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorModo: {
    flexDirection: 'row',
    backgroundColor: colores.fondo,
    borderRadius: bordes.md,
    padding: espaciado.xs,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  opcionModo: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.xs,
    borderRadius: bordes.sm,
  },
  opcionModoActiva: {
    backgroundColor: colores.primario,
  },
  textoOpcionModo: {
    fontSize: tipografia.sm,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoOpcionModoActiva: {
    color: colores.textoPrimario,
  },
  textoError: {
    fontSize: tipografia.xs,
    color: colores.peligro,
    fontWeight: '600',
  },
  filaRegistro: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.xs,
    paddingTop: espaciado.xs,
  },
  textoRegistro: {
    fontSize: tipografia.sm,
    color: colores.textoSecundario,
  },
  enlaceRegistro: {
    fontSize: tipografia.sm,
    fontWeight: '700',
    color: colores.primario,
  },
  tarjetaDemo: {
    backgroundColor: colores.superficie,
    borderRadius: bordes.lg,
    padding: espaciado.md,
    gap: espaciado.sm,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  tituloDemo: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.textoSecundario,
  },
  grillaDemo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  chipDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colores.primarioClaro,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs + 2,
    borderRadius: bordes.completo,
  },
  textoChipDemo: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.primario,
  },
});
