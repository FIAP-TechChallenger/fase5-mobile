import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/presentation/contexts/AuthContext";
import { ShowToast } from "../components/ui/Toast";
import { Medida } from "@/domain/models/Medida";
import { MedidasService } from "@/application/services/MedidaService";
import { UnidadeMedidaInserirDTO } from "@/application/dtos/producao/UnidadeMedida/UnidadeMedidaInserirDTO";
import { UnidadeMedidaApiService } from "@/infrastructure/services/producao/UnidadeMedidaApiService";
import { UnidadeMedidaAtualizarDTO } from "@/application/dtos/producao/UnidadeMedida/UnidadeMedidaAtualizarDTO";

interface MedidaContextData {
  medida: Medida[];
  loading: boolean;
  carregar(): Promise<void>;
  adicionar(unidade: UnidadeMedidaInserirDTO): Promise<boolean>;
  atualizar(medida: UnidadeMedidaAtualizarDTO): Promise<boolean>;
}

const MedidaContext = createContext<MedidaContextData | undefined>(undefined);

export const MedidaProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [medida, setMedida] = useState<Medida[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastId, setLastId] = useState<string | null>(null);

  const medidaService = new MedidasService(new UnidadeMedidaApiService());

  const carregar = async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    try {
      setLoading(true);

      const result = await medidaService.buscarTodos({
        limite: 15,
        ultimoId: !reset ? lastId : null,
      });
      setHasMore(result.temMais);
      setLastId(result.ultimoId);
      setMedida((prev) => (reset ? result.dados : [...prev, ...result.dados]));
    } catch (error) {
      setHasMore(false);
      ShowToast("error", "Erro ao carregar unidades de medida.");
    } finally {
      setLoading(false);
    }
  };
  const adicionar = async (dados: UnidadeMedidaInserirDTO) => {
    try {
      await medidaService.inserir(dados);
      await carregar(true);
      ShowToast("success", "Unidade de medida adicionada com sucesso.");
      return true;
    } catch (error) {
      ShowToast("error", "Erro ao adicionar unidade de medida.");
      return false;
    }
  };
  const atualizar = async (medida: UnidadeMedidaAtualizarDTO) => {
    try {
      await medidaService.atualizar(medida);
      await carregar(true);
      ShowToast("success", "Produção atualizada com sucesso.");
      return true;
    } catch (error) {
      ShowToast("error", "Erro ao atualizar produção.");
      return false;
    }
  };

  useEffect(() => {
    carregar(true);
  }, [userId]);

  return (
    <MedidaContext.Provider
      value={{
        medida,
        loading,
        carregar,
        adicionar,
        atualizar,
      }}
    >
      {children}
    </MedidaContext.Provider>
  );
};

export const useMedida = () => {
  const context = useContext(MedidaContext);
  if (!context) {
    throw new Error(
      "Contexto não encontrado. useProdutos deve estar dentro de MedidasProvider."
    );
  }
  return context;
};
