import { useQuery } from "@tanstack/react-query";
import { getAllBanks } from "../api/bank";

const BANK_KEY = ["banks"];

export const useGetBanksQuery = () => {
  return useQuery({
    queryKey: BANK_KEY,
    queryFn: getAllBanks,
    retry: false,
  });
};
