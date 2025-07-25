import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import { colors } from "@/shared/constants/colors";
import Icon from "./Icon";

export type ButtonColors = "orange" | "red" | "green" | "black" | "gray";

export interface ButtonOptions {
  /** Ícone */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Texto do botão */
  text?: string;
  /** Especifica se o botão deve ter o estilo "outlined", ou seja, que apresente cor apenas nas bordas e no texto. */
  outlined?: boolean;
  /** Cor do botão */
  color?: ButtonColors;
  /** Tipo do botão */
  type?: "submit" | "reset" | "button" | undefined;
  /** Estilos customizados. */
  className?: string;
  /** Especifica que o botão esta desabilitado. */
  disabled?: boolean;
  /** Função executada quando é pressionado o botão */
  onPress?: () => void;
}

export default function Button(options: ButtonOptions) {
  function getTextClass() {
    if (options.outlined) {
      if (options.disabled) return "";
      switch (options.color) {
        case "orange":
          return "text-orange-500";
        case "red":
          return "text-red-600";
        case "black":
          return "text-black";
        case "gray":
          return "text-black";
        default:
          return "text-green-600";
      }
    }
    return options.color === "gray" ? "text-black" : "text-white";
  }

  function getColorClass() {
    if (options.disabled) return "";
    switch (options.color) {
      case "orange":
        return "bg-agroflow-orange";
      case "red":
        return "bg-agroflow-red";
      case "black":
        return "bg-black";
      case "gray":
        return "bg-gray-200";
      default:
        return "bg-agroflow-green";
    }
  }

  function getOutlinedColorClass() {
    if (options.disabled) return "";
    switch (options.color) {
      case "orange":
        return "border-2 border-orange-500";
      case "red":
        return "border-2 border-red-600";
      case "black":
        return "border-2 border-black";
      case "gray":
        return "border-2 border-gray-200";
      default:
        return "border-2 border-green-600";
    }
  }

  function handlePress() {
    if (options.onPress && !options.disabled) {
      options.onPress();
    }
  }

  function btnStyle() {
    if (options.icon) return "p-2 rounded-full";
    return "px-7 py-3 rounded-lg";
  }

  return (
    <TouchableOpacity
      className={`items-center ${btnStyle()} ${
        options.outlined ? getOutlinedColorClass() : getColorClass()
      } ${options.className || ""}`}
      onPress={handlePress}
      disabled={options.disabled}
    >
      {options.icon ? (
        <Icon color={colors.agroflow.white} name={options.icon} size={24} />
      ) : (
        <Text className={`font-bold ${getTextClass()}`}>{options.text}</Text>
      )}
    </TouchableOpacity>
  );
}
