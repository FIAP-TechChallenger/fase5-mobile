import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useVenda } from "@/presentation/contexts/comercial/VendaContext";
import Input from "@/presentation/components/ui/Input";
import InputDate from "@/presentation/components/ui/InputDate";
import { Loading } from "@/presentation/components/ui/Loading";
import { Venda } from "@/domain/models/comercial/Venda";
import { ItemVenda } from "@/domain/models/comercial/ItemVenda";
import {
  VendaInserirDTO,
  VendaInserirSchema,
} from "@/application/dtos/comercial/Venda/VendaInserirDTO";
import {
  VendaAtualizarDTO,
  VendaAtualizarSchema,
} from "@/application/dtos/comercial/Venda/VendaAtualizarDTO";
import { VendaStatusEnum } from "@/domain/enum/comercial/Venda.enum";
import { useEstoqueProduto } from "@/presentation/contexts/EstoqueProdutoContext";
import SelectProdutosModal from "./Modal";
import { Feather } from "@expo/vector-icons";
import Button from "@/presentation/components/ui/Button";
import { formatarMoeda } from "@/shared/utils/formatarMoeda";

interface VendaFormProps {
  venda?: Venda;
  onCancel?: () => void;
}

const useVendaForm = (venda: Venda | undefined) => {
  return useForm<VendaInserirDTO | VendaAtualizarDTO>({
    resolver: zodResolver(venda ? VendaAtualizarSchema : VendaInserirSchema),
    defaultValues: {
      id: venda?.id,
      dataVenda: venda?.dataVenda ? new Date(venda.dataVenda) : new Date(),
      cliente: venda?.cliente ?? "",
      imposto: venda?.imposto ?? 0,
      valorTotal: venda?.valorTotal ?? 0,
      status: venda?.status ?? VendaStatusEnum.AGUARDANDO,
      itens:
        venda?.itens?.map(
          (item: ItemVenda) =>
            ({
              id: item.id,
              produtoNome: item.produtoNome,
              desconto: item.desconto,
              quantidade: item.quantidade,
              produtoId: item.produtoId,
              fazendaId: item.fazendaId,
              precoUnitario: item.precoUnitario,
              lucroUnitario: item.lucroUnitario,
            } as ItemVenda)
        ) ?? [],
    },
  });
};

export default function VendaForm({ venda, onCancel }: VendaFormProps) {
  const { adicionar, atualizar } = useVenda();
  const {
    control,
    watch,
    formState: { errors },
    handleSubmit,
    reset,
  } = useVendaForm(venda);
  const [modalVisible, setModalVisible] = useState(false);
  const { estoqueProdutos } = useEstoqueProduto();
  const readOnly = false;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  const onSubmitSalvar = async (data: VendaInserirDTO | VendaAtualizarDTO) => {
    onSubmit(VendaStatusEnum.AGUARDANDO, data);
  };

  const onSubmitFinalizar = async (
    data: VendaInserirDTO | VendaAtualizarDTO
  ) => {
    onSubmit(VendaStatusEnum.VENDIDA, data);
  };

  const onSubmit = async (
    status: VendaStatusEnum,
    data: VendaInserirDTO | VendaAtualizarDTO
  ) => {
    if (fields.length === 0) return;

    try {
      Loading.show();

      data.status = status;

      const success = venda
        ? await atualizar(data as VendaAtualizarDTO)
        : await adicionar(data as VendaInserirDTO);

      if (success) reset(!!venda ? data : undefined);
    } finally {
      Loading.hide();
    }
  };

  const confirmarSelecionados = (selecionados: any[]) => {
    const existingProductIds = fields.map((item) => item.produtoId);

    selecionados.forEach((estoqueProduto) => {
      if (!existingProductIds.includes(estoqueProduto.produtoId)) {
        // ← Usar produtoId
        append({
          produtoId: estoqueProduto.produtoId, // ← CORRETO: ID do produto
          fazendaId: estoqueProduto.fazendaId,
          quantidade: 1,
          desconto: 0,
          precoUnitario: estoqueProduto.precoUnitario ?? 0,
          lucroUnitario: 0,
          produtoNome: estoqueProduto.produtoNome,
        });
      }
    });
    setModalVisible(false);
  };

  const calcularTotalVenda = () => {
    const itens = watch("itens") || [];
    return itens.reduce((total, item) => {
      return total + (item.quantidade || 0) * (item.precoUnitario || 0);
    }, 0);
  };

  return (
    <View className="flex h-full">
      <View className="mb-4">
        <Controller
          control={control}
          name="dataVenda"
          render={({ field: { onChange, value } }) => (
            <InputDate
              label="Data da Venda"
              value={value}
              onValueChanged={onChange}
              readOnly={readOnly}
            />
          )}
        />
      </View>

      <View className="mb-6">
        <Controller
          control={control}
          name="cliente"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Cliente"
              value={value}
              onValueChanged={onChange}
              readOnly={readOnly}
              error={errors.cliente?.message}
            />
          )}
        />
      </View>

      {/* Seção de Produtos */}
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-gray-800">Produtos</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center bg-agroflow-green py-2 px-4 rounded-lg"
          >
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white ml-2 font-medium">
              Adicionar Produtos
            </Text>
          </TouchableOpacity>
        </View>

        {fields.length > 0 ? (
          <View className="">
            {fields.map((item, index) => {
              const quantidade = watch(`itens.${index}.quantidade`);
              const precoUnitario = watch(`itens.${index}.precoUnitario`);
              const totalItem = (quantidade || 0) * (precoUnitario || 0);

              return (
                <View
                  key={item.id}
                  className="rounded-xl p-4 mb-3 shadow-sm bg-gray-200"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="font-bold text-base text-gray-800 flex-1">
                      {item?.produtoNome ?? "Produto não encontrado"}
                    </Text>
                    <TouchableOpacity onPress={() => remove(index)}>
                      <Feather name="trash-2" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>

                  <View className="mb-3">
                    <Controller
                      control={control}
                      name={`itens.${index}.quantidade`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="Quantidade"
                          value={String(value)}
                          onValueChanged={(val) => onChange(Number(val))}
                        />
                      )}
                    />
                  </View>

                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-600">
                      Preço Unitário: {formatarMoeda(precoUnitario)}
                    </Text>
                    <Text className="font-bold text-gray-800">
                      Total: {formatarMoeda(totalItem)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-gray-200 rounded-lg p-8 items-center">
            <Feather name="package" size={32} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">
              Nenhum produto selecionado ainda.
            </Text>
          </View>
        )}
      </View>

      <SelectProdutosModal
        visible={modalVisible}
        produtos={estoqueProdutos}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmarSelecionados}
      />

      {/* Resumo e Botão de Finalizar */}
      <View className="flex-row justify-between items-center my-4">
        <Text className="text-lg font-bold text-gray-800">Total da Venda</Text>
        <Text className="text-xl font-bold text-green-600">
          {formatarMoeda(calcularTotalVenda())}
        </Text>
      </View>

      <View className="flex-row gap-4">
        <Button
          className="flex-1"
          text="Cancelar"
          color="red"
          onPress={onCancel}
        />
        <Button
          className="flex-1"
          text="Salvar"
          onPress={handleSubmit(onSubmitSalvar)}
        />
      </View>

      <Button
        className="flex-1 mt-4"
        text="Finalizar"
        onPress={handleSubmit(onSubmitFinalizar)}
      />
    </View>
  );
}
