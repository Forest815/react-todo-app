export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null; // 注意
  subject: "数学" | "英語" | "国語" | "理科" | "社会" | "その他"; // 追加
};
