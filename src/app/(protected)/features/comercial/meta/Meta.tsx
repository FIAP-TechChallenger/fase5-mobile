import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MetaStackParamList } from "./MetaStack";
import { useMeta } from "@/presentation/contexts/comercial/MetaContext";
import InputSelect from "@/presentation/components/ui/InputSelect";
import MetaConsts from "@/shared/constants/meta.consts";
import PageHeader from "@/presentation/components/ui/PageHeader";
import { Meta } from "@/domain/models/comercial/Meta";
import { MetaItem } from "@/presentation/components/comercial/meta/MetaItem";
import PaginatedList from "@/presentation/components/ui/PaginatedList";
import {
  MetaStatusFiltroEnum,
  MetaTipoFiltroEnum,
} from "@/domain/enum/comercial/Meta.enum";

type MetaNavigationProp = NativeStackNavigationProp<
  MetaStackParamList,
  "Lista"
>;

export function Tela() {
  const navigation = useNavigation<MetaNavigationProp>();
  const {
    metas,
    loading,
    filtroTipo,
    filtroStatus,
    carregar,
    setFiltroTipo,
    setFiltroStatus,
  } = useMeta();

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        pageName="Metas"
        showAdd={true}
        onAdicionar={() => navigation.navigate("AdicionarMeta")}
      ></PageHeader>

      <View className="px-6 pb-4 gap-2">
        <InputSelect
          label="Tipo"
          labelTextBold={false}
          options={MetaConsts.TiposFiltro}
          value={filtroTipo}
          onValueChanged={(value: MetaTipoFiltroEnum) => setFiltroTipo(value)}
        />
        <InputSelect
          label="Status"
          labelTextBold={false}
          options={MetaConsts.StatusFiltro}
          value={filtroStatus}
          onValueChanged={(value: MetaStatusFiltroEnum) =>
            setFiltroStatus(value)
          }
        />
      </View>

      <PaginatedList
        data={metas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <MetaItem meta={item} />}
        loadingMore={loading}
        onEndReached={() => carregar()}
        onEdit={(item: Meta) =>
          navigation.navigate("EditarMeta", { meta: item })
        }
      />
    </View>
  );
}

export default function Metas() {
  return <Tela />;
}
