export type ArticleUserState =
  | {
      isAuthenticated: false;
      isFavorite: false;
      isRead: false;
      message?: string;
    }
  | {
      isAuthenticated: true;
      isFavorite: boolean;
      isRead: boolean;
      message?: string;
    };

export type ProfileFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialProfileFormState: ProfileFormState = {
  status: "idle",
  message: ""
};

