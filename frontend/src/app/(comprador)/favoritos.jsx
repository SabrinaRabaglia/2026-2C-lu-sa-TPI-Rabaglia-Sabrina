import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { EstadoCarga } from '@/components/EstadoCarga';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { TarjetaEvento } from '@/components/TarjetaEvento';
import { useSesion } from '@/context/SesionContext';
import { useEventos } from '@/hooks/useEventos';
import { useAlternarFavorito, useFavoritos } from '@/hooks/useFavoritos';
import { colores, espaciado } from '@/tema';

export default function PantallaFavoritos() {
  const enrutador = useRouter();
  const { usuarioId } = useSesion();

  const consultaFavoritos = useFavoritos(usuarioId);
  const consultaTodosEventos = useEventos();
  const mutacionAlternarFavorito = useAlternarFavorito(usuarioId);

  if (consultaFavoritos.isLoading) {
    return <EstadoCarga mensaje="Cargando tus favoritos..." />;
  }

  if (consultaFavoritos.isError) {
    return (
      <EstadoError
        mensaje={
          consultaFavoritos.error instanceof Error
            ? consultaFavoritos.error.message
            : 'No pudimos cargar tus favoritos'
        }
        alReintentar={() => void consultaFavoritos.refetch()}
      />
    );
  }

  const favoritosCrudos = consultaFavoritos.data || [];
  const todosEventos = Array.isArray(consultaTodosEventos.data)
    ? consultaTodosEventos.data
    : consultaTodosEventos.data?.items || [];

  const favoritosEnriquecidos = favoritosCrudos.map(
    (fav) => todosEventos.find((ev) => ev.id === fav.id) || fav
  );

  if (favoritosEnriquecidos.length === 0) {
    return (
      <EstadoVacio
        icono="heart-outline"
        titulo="Todavía no guardaste eventos favoritos"
        subtitulo="Tocá el corazón en cualquier evento del catálogo para guardarlo acá."
        etiquetaAccion="Explorar eventos"
        alAccionar={() => enrutador.navigate('/(comprador)')}
      />
    );
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={favoritosEnriquecidos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={estilos.contenidoLista}
        refreshControl={
          <RefreshControl
            refreshing={consultaFavoritos.isRefetching}
            onRefresh={() => void consultaFavoritos.refetch()}
            tintColor={colores.primario}
          />
        }
        renderItem={({ item }) => (
          <TarjetaEvento
            evento={item}
            esFavorito
            alPresionar={() => enrutador.push(`/evento/${item.id}`)}
            alAlternarFavorito={() =>
              mutacionAlternarFavorito.mutate({
                evento: item,
                esFavorito: true,
              })
            }
          />
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenidoLista: {
    padding: espaciado.lg,
    gap: espaciado.lg,
  },
});
