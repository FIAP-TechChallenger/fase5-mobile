import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Loading } from "@/presentation/components/ui/Loading";
import Input from "@/presentation/components/ui/Input";
import InputSelect from "@/presentation/components/ui/InputSelect";
import InputDate from "@/presentation/components/ui/InputDate";
import Button from "@/presentation/components/ui/Button";
import { useProducao } from "@/presentation/contexts/ProducaoContext";
import { useProdutos } from "@/presentation/contexts/ProdutoContext";
import { useFazenda } from "@/presentation/contexts/FazendaContext";
import {
  ProducaoInserirDTO,
  ProducaoInserirSchema,
} from "@/application/dtos/producao/Producao/ProducaoInserirDTO";
import { DateUtils } from "@/shared/utils/date.utils";
import { ProducaoStatusEnum } from "@/domain/enum/producao/producao.enum";
import { Producao } from "@/domain/models/Producao";
import {
  ProducaoAtualizarDTO,
  ProducaoAtualizarSchema,
} from "@/application/dtos/producao/Producao/ProducaoAtualizarDTO";
import ModalColheita from "./ModalColheita";
import FazendaSelect from "../Fazenda/FazendaSelect";

interface ProducaoFormProps {
  producao?: Producao;
  onCancel?: () => void;
}

const useProducaoForm = (producao: Producao | undefined) => {
  return useForm<ProducaoInserirDTO | ProducaoAtualizarDTO>({
    resolver: zodResolver(
      !!producao ? ProducaoAtualizarSchema : ProducaoInserirSchema
    ),
    defaultValues: {
      id: producao?.id,
      quantidadePlanejada: producao?.quantidadePlanejada,
      precoPlanejado: producao?.precoPlanejado,
      status: producao?.status ?? ProducaoStatusEnum.AGUARDANDO,
      produtoId: producao?.produtoId,
      fazendaId: producao?.fazendaId,
      lote: producao?.lote,
      dataInicio: producao?.dataInicio
        ? new Date(producao.dataInicio)
        : new Date(),
      dataFim: producao?.dataFim
        ? new Date(producao.dataFim)
        : DateUtils.nowToEndOfMonth(),
      insumos: producao?.insumos ?? [],
      custoProducao: producao?.custoProducao,
      precoFinal: producao?.precoFinal,
      quantidadeColhida: producao?.quantidadeColhida,
      perdas: producao?.perdas,
    },
  });
};

export default function ProducaoForm({
  producao,
  onCancel,
}: ProducaoFormProps) {
  const { adicionar, atualizar } = useProducao();
  const { produtos } = useProdutos();
  const [mostrarModalColheita, setMostrarModalColheita] = useState(false);
  const [colheitaTemp, setColheitaTemp] = useState<{
    quantidadeColhida: number;
    perdas: number;
    precoFinal: number;
    custoProducao: number;
  } | null>(null);

  const readOnly = !!producao && producao.status === ProducaoStatusEnum.COLHIDA;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useProducaoForm(producao);

  const { fields } = useFieldArray({ control, name: "insumos" });
  const produtoId = watch("produtoId");
  const produtoSelecionado = produtos.find((p) => p.id === produtoId);

  const onSubmit = async (data: ProducaoInserirDTO | ProducaoAtualizarDTO) => {
    try {
      Loading.show();

      const dataFinal = {
        ...data,
        ...(data.status === ProducaoStatusEnum.COLHIDA ? colheitaTemp : {}),
      };

      console.log(dataFinal);

      const success = !!producao
        ? await atualizar(dataFinal as ProducaoAtualizarDTO)
        : await adicionar(dataFinal as ProducaoInserirDTO);

      if (success) {
        reset(!!producao ? dataFinal : undefined);
        setColheitaTemp(null);
      }
    } finally {
      Loading.hide();
    }
  };

  useEffect(() => {
    if (!producao && produtoSelecionado) {
      setValue(
        "insumos",
        produtoSelecionado.insumosDetalhados?.map((i) => ({
          insumoId: i.id,
          quantidade: 0,
        })) || []
      );
    }
  }, [produtoSelecionado]);

  return (
    <View className="flex pb-20 gap-4 h-full">
      {/* Seleção de Fazenda */}
      <Controller
        control={control}
        name="fazendaId"
        render={({ field: { onChange, value } }) => (
          <FazendaSelect
            label="Fazenda"
            readOnly={readOnly}
            value={value}
            onValueChanged={onChange}
            error={errors.fazendaId?.message}
          />
        )}
      />

      {/* Seleção de Produto */}
      <Controller
        control={control}
        name="produtoId"
        render={({ field: { onChange, value } }) => (
          <InputSelect
            label="Produto"
            options={produtos.map((p) => ({ label: p.nome, value: p.id }))}
            value={value}
            onValueChanged={onChange}
            readOnly={readOnly}
            error={errors.produtoId?.message}
          />
        )}
      />

      {/* Insumos */}
      {produtoSelecionado && fields.length > 0 && (
        <View className="gap-2">
          <Text className="text-lg font-semibold">Insumos</Text>
          {fields.map((field, index) => {
            const insumo = produtoSelecionado.insumosDetalhados?.find(
              (i) => i.id === field.insumoId
            );
            return (
              <Controller
                key={field.id}
                control={control}
                name={`insumos.${index}.quantidade`}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={insumo?.nome || "Insumo"}
                    type="number"
                    value={value !== undefined ? value.toString() : "0"}
                    onValueChanged={(text) => onChange(Number(text))}
                    readOnly={readOnly}
                    error={errors.insumos?.[index]?.quantidade?.message}
                  />
                )}
              />
            );
          })}
        </View>
      )}

      {/* Quantidade e Lote */}
      <Controller
        control={control}
        name="quantidadePlanejada"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Quantidade Planejada"
            type="number"
            value={value !== undefined ? value.toString() : "0"}
            onValueChanged={(text) => onChange(Number(text))}
            readOnly={readOnly}
            error={errors.quantidadePlanejada?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="lote"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Lote"
            value={value}
            onValueChanged={onChange}
            readOnly={readOnly}
            error={errors.lote?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="precoPlanejado"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Preço Estimado (R$)"
            type="number"
            value={value !== undefined ? value.toString() : "0"}
            onValueChanged={(text) => onChange(Number(text))}
            readOnly={readOnly}
            error={errors.precoPlanejado?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <InputSelect
            label="Status"
            value={value}
            onValueChanged={(val: string) => {
              const novoStatus = val as ProducaoStatusEnum;
              onChange(novoStatus);

              if (
                novoStatus === ProducaoStatusEnum.COLHIDA &&
                !colheitaTemp &&
                producao?.status !== ProducaoStatusEnum.COLHIDA
              ) {
                setMostrarModalColheita(true);
              }
            }}
            options={Object.entries(ProducaoStatusEnum).map(([key, val]) => ({
              label: val,
              value: val,
            }))}
            readOnly={readOnly}
            error={errors.status?.message}
          />
        )}
      />
      {colheitaTemp && (
        <View className="bg-gray-100 p-3 rounded-xl mt-2">
          <Text className="text-sm font-semibold mb-1 text-gray-700">
            Dados da Colheita
          </Text>
          <Text className="text-x text-gray-600">
            Quantidade Colhida: {colheitaTemp.quantidadeColhida}
          </Text>
          <Text className="text-x text-gray-600">
            Perdas: {colheitaTemp.perdas}
          </Text>
          <Text className="text-x text-gray-600">
            Custo de Produção: R$ {colheitaTemp.custoProducao.toFixed(2)}
          </Text>
          <Text className="text-x text-gray-600">
            Preço de Venda Final: R$ {colheitaTemp.precoFinal.toFixed(2)}
          </Text>
          <Button
            text="Editar"
            onPress={() => setMostrarModalColheita(true)}
            className="px-2 py-1 mt-2 self-end bg-green-350 rounded-md"
          />
        </View>
      )}

      {/* Datas */}
      <View className="flex-row gap-3">
        <Controller
          control={control}
          name="dataInicio"
          render={({ field: { onChange, value } }) => (
            <InputDate
              className="flex-1"
              label="Data Início"
              value={value}
              onValueChanged={onChange}
              readOnly={readOnly}
            />
          )}
        />
        <Controller
          control={control}
          name="dataFim"
          render={({ field: { onChange, value } }) => (
            <InputDate
              className="flex-1"
              label="Data Fim"
              value={value}
              onValueChanged={onChange}
              readOnly={readOnly}
            />
          )}
        />
      </View>
      <View className="flex">
        {errors.dataInicio?.message && (
          <Text className="w-full text-red-500">
            {errors.dataInicio?.message}
          </Text>
        )}
        {errors.dataFim?.message && (
          <Text className="w-full text-red-500">{errors.dataFim?.message}</Text>
        )}
      </View>

      <View className="flex-row gap-3 mt-4">
        <Button
          className="flex-1"
          text="Cancelar"
          color="red"
          onPress={onCancel}
        />
        <Button
          className="flex-1"
          text="Salvar"
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <ModalColheita
        visible={mostrarModalColheita}
        onClose={() => setMostrarModalColheita(false)}
        onConfirm={(dados) => {
          setColheitaTemp(dados);
          setMostrarModalColheita(false);
        }}
        quantidadePlanejada={watch("quantidadePlanejada") || 0}
        precoPlanejado={watch("precoPlanejado") || 0}
      />
    </View>
  );
}
