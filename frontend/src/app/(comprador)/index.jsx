import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarraBusqueda } from '@/components/BarraBusqueda';
import { ChipsCategorias } from '@/components/ChipsCategorias';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { ModalOrdenamiento, OPCIONES_ORDEN } from '@/components/ModalOrdenamiento';
import { TarjetaEvento } from '@/components/TarjetaEvento';
import { useSesion } from '@/context/SesionContext';
import { useCategorias } from '@/hooks/useCategorias';
import { useEventos } from '@/hooks/useEventos';
import { useAlternarFavorito, useFavoritos } from '@/hooks/useFavoritos';
import { bordes, colores, espaciado, tipografia } from '@/tema';

const LIMITE_PAGINA = 4;

export default function PantallaExplorar() {
  const enrutador = useRouter();
  const { usuarioId } = useSesion();

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [opcionOrden, setOpcionOrden] = useState(OPCIONES_ORDEN[0]);
  const [soloFuturos, setSoloFuturos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [modalOrdenVisible, setModalOrdenVisible] = useState(false);

  // Debounce de 300 ms para la barra de búsqueda
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBusquedaDebounced(textoBusqueda.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(temporizador);
  }, [textoBusqueda]);

  const consultaCategorias = useCategorias();
  const consultaFavoritos = useFavoritos(usuarioId);
  const mutacionAlternarFavorito = useAlternarFavorito(usuarioId);

  const idsFavoritos = useMemo(() => {
    const lista = consultaFavoritos.data || [];
    return new Set(lista.map((fav) => fav.id));
  }, [consultaFavoritos.data]);

  const filtros = useMemo(
    () => ({
      texto: busquedaDebounced || undefined,
      categoriaIds:
        categoriasSeleccionadas.length > 0
          ? categoriasSeleccionadas.join(',')
          : undefined,
      ordenarPor: opcionOrden.ordenarPor,
      direccion: opcionOrden.direccion,
      soloFuturos: soloFuturos ? 'true' : undefined,
      page: pagina,
      limit: LIMITE_PAGINA,
    }),
    [busquedaDebounced, categoriasSeleccionadas, opcionOrden, soloFuturos, pagina]
  );

  const consultaEventos = useEventos(filtros);

  const datosEventos = consultaEventos.data;
  const items = Array.isArray(datosEventos)
    ? datosEventos
    : datosEventos?.items || [];
  const paginacion = !Array.isArray(datosEventos)
    ? datosEventos?.pagination
    : null;

  const manejarAlternarCategoria = (categoriaId) => {
    setPagina(1);
    setCategoriasSeleccionadas((previas) =>
      previas.includes(categoriaId)
        ? previas.filter((id) => id !== categoriaId)
        : [...previas, categoriaId]
    );
  };

  const manejarLimpiarFiltros = () => {
    setTextoBusqueda('');
    setBusquedaDebounced('');
    setCategoriasSeleccionadas([]);
    setSoloFuturos(false);
    setPagina(1);
  };

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.encabezadoFijo}>
        <BarraBusqueda valor={textoBusqueda} alCambiarTexto={setTextoBusqueda} />

        <ChipsCategorias
          categorias={consultaCategorias.data || []}
          idsSeleccionados={categoriasSeleccionadas}
          alAlternarCategoria={manejarAlternarCategoria}
          alLimpiarTodas={() => {
            setCategoriasSeleccionadas([]);
            setPagina(1);
          }}
        />

        <View style={estilos.filaHerramientas}>
          <Pressable
            onPress={() => {
              setSoloFuturos((previo) => !previo);
              setPagina(1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Solo futuros: filtrar solo eventos próximos"
            accessibilityState={{ selected: soloFuturos }}
            style={[
              estilos.pastillaFiltro,
              soloFuturos && estilos.pastillaFiltroActiva,
            ]}
          >
            <Ionicons
              name={soloFuturos ? 'checkmark-circle' : 'time-outline'}
              size={16}
              color={
                soloFuturos
                  ? colores.primarioTextoClaro
                  : colores.textoSecundario
              }
            />
            <Text
              style={[
                estilos.textoPastillaFiltro,
                soloFuturos && estilos.textoPastillaFiltroActiva,
              ]}
            >
              Solo futuros
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setModalOrdenVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`${opcionOrden.etiqueta}. Cambiar ordenamiento`}
            style={estilos.botonOrdenar}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={16}
              color={colores.primarioTextoClaro}
            />
            <Text style={estilos.textoBotonOrdenar} numberOfLines={1}>
              {opcionOrden.etiqueta}
            </Text>
          </Pressable>
        </View>
      </View>

      {consultaEventos.isLoading ? (
        <EstadoCarga mensaje="Buscando eventos..." />
      ) : consultaEventos.isError ? (
        <EstadoError
          mensaje={
            consultaEventos.error instanceof Error
              ? consultaEventos.error.message
              : 'No pudimos cargar los eventos'
          }
          alReintentar={() => void consultaEventos.refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio
          icono="search-outline"
          titulo="No encontramos eventos para tu búsqueda"
          subtitulo="Probá cambiando los filtros o limpiando la búsqueda."
          etiquetaAccion="Limpiar filtros"
          alAccionar={manejarLimpiarFiltros}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={estilos.contenidoLista}
          refreshControl={
            <RefreshControl
              refreshing={consultaEventos.isRefetching}
              onRefresh={() => void consultaEventos.refetch()}
              tintColor={colores.primario}
            />
          }
          renderItem={({ item }) => {
            const esFav = idsFavoritos.has(item.id);
            return (
              <TarjetaEvento
                evento={item}
                esFavorito={esFav}
                alPresionar={() => enrutador.push(`/evento/${item.id}`)}
                alAlternarFavorito={() =>
                  mutacionAlternarFavorito.mutate({
                    evento: item,
                    esFavorito: esFav,
                  })
                }
              />
            );
          }}
          ListFooterComponent={
            paginacion ? (
              <View style={estilos.barraPaginacion}>
                <Pressable
                  onPress={() =>
                    paginacion.hasPrevPage &&
                    setPagina((p) => Math.max(1, p - 1))
                  }
                  disabled={!paginacion.hasPrevPage}
                  accessibilityRole="button"
                  accessibilityLabel="Página anterior"
                  style={[
                    estilos.botonPagina,
                    !paginacion.hasPrevPage && estilos.botonPaginaDeshabilitado,
                  ]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={colores.texto}
                  />
                  <Text style={estilos.textoBotonPagina}>Anterior</Text>
                </Pressable>

                <Text style={estilos.indicadorPagina}>
                  Página {paginacion.page} de {paginacion.totalPages} (
                  {paginacion.total})
                </Text>

                <Pressable
                  onPress={() =>
                    paginacion.hasNextPage && setPagina((p) => p + 1)
                  }
                  disabled={!paginacion.hasNextPage}
                  accessibilityRole="button"
                  accessibilityLabel="Página siguiente"
                  style={[
                    estilos.botonPagina,
                    !paginacion.hasNextPage && estilos.botonPaginaDeshabilitado,
                  ]}
                >
                  <Text style={estilos.textoBotonPagina}>Siguiente</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colores.texto}
                  />
                </Pressable>
              </View>
            ) : null
          }
        />
      )}

      <ModalOrdenamiento
        visible={modalOrdenVisible}
        idOpcionSeleccionada={opcionOrden.id}
        alSeleccionar={(opcion) => {
          setOpcionOrden(opcion);
          setPagina(1);
        }}
        alCerrar={() => setModalOrdenVisible(false)}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  encabezadoFijo: {
    backgroundColor: colores.superficie,
    paddingHorizontal: espaciado.lg,
    paddingTop: espaciado.md,
    paddingBottom: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    gap: espaciado.sm,
  },
  filaHerramientas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.sm,
  },
  pastillaFiltro: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  pastillaFiltroActiva: {
    backgroundColor: colores.primarioClaro,
    borderColor: colores.primario,
  },
  textoPastillaFiltro: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
  textoPastillaFiltroActiva: {
    color: colores.primarioTextoClaro,
  },
  botonOrdenar: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: espaciado.xs,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: bordes.completo,
    backgroundColor: colores.primarioClaro,
  },
  textoBotonOrdenar: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.primarioTextoClaro,
    flexShrink: 1,
  },
  contenidoLista: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
  barraPaginacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: espaciado.sm,
    paddingBottom: espaciado.lg,
  },
  botonPagina: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: bordes.md,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  botonPaginaDeshabilitado: {
    opacity: 0.4,
  },
  textoBotonPagina: {
    fontSize: tipografia.xs,
    fontWeight: '700',
    color: colores.texto,
  },
  indicadorPagina: {
    fontSize: tipografia.xs,
    fontWeight: '600',
    color: colores.textoSecundario,
  },
});
