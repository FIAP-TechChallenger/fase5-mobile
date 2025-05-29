import { formatarMoeda } from "@/shared/utils/formatarMoeda";
import { Text, View } from "react-native";
import { useSaldoContext } from "@/presentation/contexts/SaldoContext";

export default function Saldo() {
  const { saldo } = useSaldoContext();
  const saldoFormato = formatarMoeda(saldo ?? 0);

  return (
    <View className="p-6">
      <Text className="text-white text-xl font-semibold">Bem vindo,</Text>
      <Text className="text-white text-xl">Saldo {saldoFormato}</Text>
    </View>
  );
}
