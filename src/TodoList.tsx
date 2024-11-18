import React, { useState } from "react";
import { Todo } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faClock,
  faFaceGrinWide,
  faEdit,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  remove: (id: string) => void;
  updateTodo: (updatedTodo: Todo) => void;
};

const num2star = (n: number): string => "★".repeat(4 - n);

const TodoList = (props: Props) => {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editError, setEditError] = useState<string>("");

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTodo({ ...todo });
    setEditError("");
  };

  const saveEditing = () => {
    if (editingTodo) {
      const nameError = isValidTodoName(editingTodo.name);
      const priorityError = isValidTodoPriority(editingTodo.priority);
      if (nameError || priorityError) {
        setEditError(nameError || priorityError);
        return;
      }
      props.updateTodo(editingTodo);
      setEditingTodoId(null);
      setEditingTodo(null);
      setEditError("");
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingTodo) {
      const { name, value } = e.target;
      setEditingTodo({
        ...editingTodo,
        [name]:
          name === "priority"
            ? Number(value)
            : name === "deadline"
              ? new Date(value)
              : value,
      });
    }
  };

  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "名前は2文字以上、32文字以内で入力してください";
    } else {
      return "";
    }
  };

  const isValidTodoPriority = (priority: number): string => {
    if (priority < 1 || priority > 3) {
      return "優先度は1から3の範囲で入力してください";
    } else {
      return "";
    }
  };

  const todos = props.todos;

  if (todos.length === 0) {
    return (
      <div className="text-red-500">
        現在、登録されているタスクはありません。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={twMerge(
            "rounded-md border border-slate-500 bg-white px-3 py-2 drop-shadow-md",
            todo.isDone && "bg-blue-50 opacity-50"
          )}
        >
          {todo.isDone && (
            <div className="mb-1 rounded bg-blue-400 px-2 py-0.5 text-center text-xs text-white">
              <FontAwesomeIcon icon={faFaceGrinWide} className="mr-1.5" />
              完了済み
              <FontAwesomeIcon icon={faFaceGrinWide} className="ml-1.5" />
            </div>
          )}
          <div className="flex items-baseline justify-between text-slate-700">
            <div className="flex items-baseline">
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={(e) => props.updateIsDone(todo.id, e.target.checked)}
                className="mr-1.5 cursor-pointer"
              />
              <FontAwesomeIcon
                icon={faFile}
                flip="horizontal"
                className="mr-1"
              />
              {editingTodoId === todo.id ? (
                <input
                  type="text"
                  name="name"
                  value={editingTodo?.name || ""}
                  onChange={handleEditChange}
                  className="text-lg font-bold"
                />
              ) : (
                <div
                  className={twMerge(
                    "text-lg font-bold",
                    todo.isDone && "line-through decoration-2"
                  )}
                >
                  {todo.name}
                </div>
              )}
              <div className="ml-2">優先度 </div>
              {editingTodoId === todo.id ? (
                <input
                  type="number"
                  name="priority"
                  value={editingTodo?.priority || 0}
                  onChange={handleEditChange}
                  className="ml-2 text-orange-400"
                  min="1"
                  max="3"
                />
              ) : (
                <div className="ml-2 text-orange-400">
                  {num2star(todo.priority)}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {editingTodoId === todo.id ? (
                <button
                  onClick={saveEditing}
                  className="rounded-md bg-green-500 px-2 py-1 text-sm font-bold text-white hover:bg-green-600"
                >
                  <FontAwesomeIcon icon={faSave} />
                </button>
              ) : (
                <button
                  onClick={() => startEditing(todo)}
                  className="rounded-md bg-blue-500 px-2 py-1 text-sm font-bold text-white hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              )}
              <button
                onClick={() => props.remove(todo.id)}
                className="rounded-md bg-slate-200 px-2 py-1 text-sm font-bold text-white hover:bg-red-500"
              >
                削除
              </button>
            </div>
          </div>
          {editingTodoId === todo.id ? (
            <div className="ml-4 flex items-center text-sm text-slate-500">
              <FontAwesomeIcon
                icon={faClock}
                flip="horizontal"
                className="mr-1.5"
              />
              <input
                type="datetime-local"
                name="deadline"
                value={
                  editingTodo?.deadline
                    ? dayjs(editingTodo.deadline).format("YYYY-MM-DDTHH:mm:ss")
                    : ""
                }
                onChange={handleEditChange}
                className="rounded-md border border-gray-400 px-2 py-0.5"
              />
            </div>
          ) : (
            todo.deadline && (
              <div className="ml-4 flex items-center text-sm text-slate-500">
                <FontAwesomeIcon
                  icon={faClock}
                  flip="horizontal"
                  className="mr-1.5"
                />
                <div className={twMerge(todo.isDone && "line-through")}>
                  期限: {dayjs(todo.deadline).format("YYYY年M月D日 H時m分")}
                </div>
              </div>
            )
          )}
          {editError && editingTodoId === todo.id && (
            <div className="text-red-500">{editError}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TodoList;
