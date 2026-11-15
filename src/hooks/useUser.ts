import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, updateUser, uploadProfilePic } from "../api/user";
import type { IUser } from "../api/auth";

const USER_KEY = ["user"];

export const useUserQuery = () => {
  return useQuery({
    queryKey: USER_KEY,
    queryFn: getUser,
    retry: false,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: IUser }) => updateUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...USER_KEY] });
    },
  });
};

export const useUploadProfilePicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: { image: string } }) =>
      uploadProfilePic(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...USER_KEY] });
    },
  });
};
