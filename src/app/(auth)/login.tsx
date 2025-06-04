import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/presentation/contexts/AuthContext";
import Button from "@/presentation/components/ui/Button";
import Input from "@/presentation/components/ui/Input";
import { LoginFormErrors, LoginForm } from "@/presentation/models/LoginForm";
import { ShowToast } from "@/presentation/components/ui/Toast";
import { Loading } from "@/presentation/components/ui/Loading";

export default function Login() {
  const { login } = useAuth();
  const [values, setValues] = useState<LoginForm>(new LoginForm());
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [loginRunning, setLoginRunning] = useState(false);

  function handleOnChange(field: string, value: any) {
    setValues(new LoginForm({ ...values, [field]: value }));
  }

  const onConfirm = async () => {
    if (!loginRunning) {
      Loading.show();
      setLoginRunning(true);

      const { isValid, errors } = values.validate();
      setErrors(errors);

      if (isValid) {
        try {
          const isAuthenticated = await login(values.email, values.password);
          if (isAuthenticated) {
            router.replace("/(protected)/Home");
          } else {
            ShowToast("error", "Credenciais incorretas.");
          }
        } catch (error) {
          if (error instanceof Error) {
            ShowToast(
              "error",
              error.message || "Erro desconhecido ao fazer login."
            );
          }
        }
      }
      setLoginRunning(false);
      Loading.hide();
    }
  };

  return (
    <View className="flex-1 bg-fiap-white items-center py-12">
      <Image
        className="mb-8"
        source={require("@/assets/images/ilustracao-login.png")}
        style={{ height: 240 }}
        resizeMode="contain"
      />

      <Text className="font-bold text-xl pb-4">Login</Text>

      <View className="w-full px-12">
        <Input
          className="pb-5"
          type="email"
          label="Email"
          value={values.email}
          placeholder="Digite seu email"
          error={errors.email}
          onValueChanged={(value) => handleOnChange("email", value)}
        ></Input>

        <Input
          className="pb-6"
          type="password"
          label="Senha"
          value={values.password}
          placeholder="Digite sua senha"
          error={errors.password}
          onValueChanged={(value) => handleOnChange("password", value)}
        ></Input>
      </View>

      <Button color="orange" text="Acessar" onPress={onConfirm} />
    </View>
  );
}
